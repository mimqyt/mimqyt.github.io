$ErrorActionPreference = "Stop"
$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:Sessions = @{}
$script:LoginAttempts = @{}
$script:SessionCookie = "tarcza_staff"
$script:SessionLifetime = [TimeSpan]::FromHours(8)
$script:KdfIterations = 600000

function Get-BytesFromSecureString {
  param([System.Security.SecureString]$Value)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    $plainText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    return [Text.Encoding]::UTF8.GetBytes($plainText)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $plainText = $null
  }
}

function Get-PasswordHash {
  param([byte[]]$PasswordBytes, [byte[]]$Salt)

  $deriver = [Security.Cryptography.Rfc2898DeriveBytes]::new(
    $PasswordBytes,
    $Salt,
    $script:KdfIterations,
    [Security.Cryptography.HashAlgorithmName]::SHA256
  )
  try {
    return $deriver.GetBytes(32)
  } finally {
    $deriver.Dispose()
  }
}

function Test-FixedTimeBytes {
  param([byte[]]$First, [byte[]]$Second)

  if ($First.Length -ne $Second.Length) { return $false }
  $difference = 0
  for ($index = 0; $index -lt $First.Length; $index += 1) {
    $difference = $difference -bor ($First[$index] -bxor $Second[$index])
  }
  return $difference -eq 0
}

function Write-JsonResponse {
  param(
    [System.Net.HttpListenerContext]$Context,
    [int]$StatusCode,
    [object]$Value
  )

  $json = ConvertTo-Json -InputObject $Value -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = "application/json; charset=utf-8"
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.Headers["Cache-Control"] = "no-store"
  $Context.Response.Headers["X-Content-Type-Options"] = "nosniff"
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  $Context.Response.Close()
}

function Write-EmptyResponse {
  param([System.Net.HttpListenerContext]$Context, [int]$StatusCode)

  $Context.Response.StatusCode = $StatusCode
  $Context.Response.Headers["Cache-Control"] = "no-store"
  $Context.Response.Headers["X-Content-Type-Options"] = "nosniff"
  $Context.Response.ContentLength64 = 0
  $Context.Response.Close()
}

function Test-RequestOrigin {
  param([System.Net.HttpListenerRequest]$Request)

  $origin = $Request.Headers["Origin"]
  if (-not $origin) { return $true }
  try {
    $originUri = [Uri]::new($origin)
    return $originUri.Scheme -eq "http" -and $originUri.Authority -eq $Request.Url.Authority
  } catch {
    return $false
  }
}

function Read-RequestJson {
  param([System.Net.HttpListenerRequest]$Request)

  if ($Request.ContentLength64 -lt 0 -or $Request.ContentLength64 -gt 8192) { throw "Invalid request body size." }
  $reader = [IO.StreamReader]::new($Request.InputStream, $Request.ContentEncoding)
  try {
    $raw = $reader.ReadToEnd()
    return ConvertFrom-Json -InputObject $raw
  } finally {
    $reader.Dispose()
  }
}

function Get-SessionForRequest {
  param([System.Net.HttpListenerRequest]$Request)

  $cookie = $Request.Cookies[$script:SessionCookie]
  if (-not $cookie -or -not $cookie.Value) { return $null }
  $token = $cookie.Value
  if ($token -notmatch "^[a-f0-9]{64}$") { return $null }
  $session = $script:Sessions[$token]
  if (-not $session) { return $null }
  if ($session.ExpiresAt -le [DateTime]::UtcNow) {
    $script:Sessions.Remove($token)
    return $null
  }
  return $session
}

function Invoke-ApiRequest {
  param([System.Net.HttpListenerContext]$Context)

  $request = $Context.Request
  $path = $request.Url.AbsolutePath
  if ($path -in @("/api/employee/login", "/api/employee/discount", "/api/employee/logout") -and -not (Test-RequestOrigin $request)) {
    Write-EmptyResponse $Context 403
    return
  }

  if ($path -eq "/api/employee/login" -and $request.HttpMethod -eq "POST") {
    $ip = $request.RemoteEndPoint.Address.ToString()
    $attempt = $script:LoginAttempts[$ip]
    $now = [DateTime]::UtcNow
    if ($attempt -and $attempt.LockedUntil -gt $now) {
      $Context.Response.Headers["Retry-After"] = [Math]::Ceiling(($attempt.LockedUntil - $now).TotalSeconds).ToString()
      Write-EmptyResponse $Context 429
      return
    }

    try {
      $payload = Read-RequestJson $request
      $password = [string]$payload.password
      $passwordBytes = [Text.Encoding]::UTF8.GetBytes($password)
      $candidateHash = Get-PasswordHash $passwordBytes $script:PasswordSalt
      [Array]::Clear($passwordBytes, 0, $passwordBytes.Length)
      $matches = Test-FixedTimeBytes $candidateHash $script:PasswordHash
      [Array]::Clear($candidateHash, 0, $candidateHash.Length)
      $password = $null
      $payload = $null
    } catch {
      Write-EmptyResponse $Context 400
      return
    }

    if (-not $matches) {
      if (-not $attempt -or ($now - $attempt.WindowStarted).TotalMinutes -ge 15) {
        $attempt = @{ Count = 0; WindowStarted = $now; LockedUntil = [DateTime]::MinValue }
      }
      $attempt.Count += 1
      if ($attempt.Count -ge 5) { $attempt.LockedUntil = $now.AddMinutes(15) }
      $script:LoginAttempts[$ip] = $attempt
      Write-EmptyResponse $Context $(if ($attempt.LockedUntil -gt $now) { 429 } else { 401 })
      return
    }

    $script:LoginAttempts.Remove($ip)
    foreach ($oldToken in @($script:Sessions.Keys)) {
      if ($script:Sessions[$oldToken].ExpiresAt -le $now) { $script:Sessions.Remove($oldToken) }
    }
    if ($script:Sessions.Count -ge 1000) {
      Write-EmptyResponse $Context 503
      return
    }
    $randomBytes = New-Object byte[] 32
    $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $generator.GetBytes($randomBytes) } finally { $generator.Dispose() }
    $token = [BitConverter]::ToString($randomBytes).Replace("-", "").ToLowerInvariant()
    [Array]::Clear($randomBytes, 0, $randomBytes.Length)
    $script:Sessions[$token] = @{
      ExpiresAt = $now.Add($script:SessionLifetime)
      Discount = 0
    }
    $Context.Response.Headers.Add(
      "Set-Cookie",
      "$($script:SessionCookie)=$token; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800"
    )
    Write-JsonResponse $Context 200 @{ authenticated = $true; discount = 0 }
    return
  }

  if ($path -eq "/api/employee/session" -and $request.HttpMethod -eq "GET") {
    $session = Get-SessionForRequest $request
    if (-not $session) { Write-EmptyResponse $Context 401; return }
    Write-JsonResponse $Context 200 @{ authenticated = $true; discount = $session.Discount }
    return
  }

  if ($path -eq "/api/employee/discount" -and $request.HttpMethod -eq "POST") {
    $session = Get-SessionForRequest $request
    if (-not $session) { Write-EmptyResponse $Context 401; return }
    try {
      $payload = Read-RequestJson $request
      $discount = 0
      if (-not [int]::TryParse([string]$payload.discount, [ref]$discount) -or $discount -lt 0 -or $discount -gt 100) {
        Write-EmptyResponse $Context 400
        return
      }
    } catch {
      Write-EmptyResponse $Context 400
      return
    }
    $session.Discount = $discount
    Write-JsonResponse $Context 200 @{ discount = $discount }
    return
  }

  if ($path -eq "/api/employee/logout" -and $request.HttpMethod -eq "POST") {
    $cookie = $request.Cookies[$script:SessionCookie]
    if ($cookie -and $script:Sessions.ContainsKey($cookie.Value)) {
      $script:Sessions.Remove($cookie.Value)
    }
    $Context.Response.Headers.Add(
      "Set-Cookie",
      "$($script:SessionCookie)=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
    )
    Write-EmptyResponse $Context 204
    return
  }

  Write-EmptyResponse $Context 404
}

function Invoke-StaticRequest {
  param([System.Net.HttpListenerContext]$Context)

  $request = $Context.Request
  if ($request.HttpMethod -notin @("GET", "HEAD")) {
    Write-EmptyResponse $Context 405
    return
  }

  $relativePath = [Uri]::UnescapeDataString($request.Url.AbsolutePath).TrimStart("/")
  if (-not $relativePath) { $relativePath = "index.html" }
  if ($relativePath -eq "employee") { $relativePath = "employee.html" }
  if ($relativePath -match "(^|[\\/])\." -or $relativePath.Contains("..")) {
    Write-EmptyResponse $Context 404
    return
  }
  $filePath = [IO.Path]::GetFullPath([IO.Path]::Combine($script:Root, $relativePath))
  if (-not $filePath.StartsWith($script:Root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
    Write-EmptyResponse $Context 404
    return
  }

  $mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".js" = "text/javascript; charset=utf-8"
    ".svg" = "image/svg+xml"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".png" = "image/png"
  }
  $extension = [IO.Path]::GetExtension($filePath).ToLowerInvariant()
  if (-not $mimeTypes.ContainsKey($extension)) {
    Write-EmptyResponse $Context 404
    return
  }

  $bytes = [IO.File]::ReadAllBytes($filePath)
  $Context.Response.StatusCode = 200
  $Context.Response.ContentType = $mimeTypes[$extension]
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.Headers["X-Content-Type-Options"] = "nosniff"
  $Context.Response.Headers["Referrer-Policy"] = "same-origin"
  $Context.Response.Headers["X-Frame-Options"] = "DENY"
  if ($request.HttpMethod -eq "GET") { $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length) }
  $Context.Response.Close()
}

$passwordSecure = $null
if ($env:TARCZA_EMPLOYEE_PASSWORD) {
  $passwordSecure = ConvertTo-SecureString -String $env:TARCZA_EMPLOYEE_PASSWORD -AsPlainText -Force
  Remove-Item Env:TARCZA_EMPLOYEE_PASSWORD -ErrorAction SilentlyContinue
} else {
  $passwordSecure = Read-Host "Wpisz haslo panelu pracowniczego (nie bedzie wyswietlane ani zapisywane w kodzie)" -AsSecureString
}
if ($passwordSecure.Length -lt 8) {
  throw "Haslo musi miec co najmniej 8 znakow."
}

$script:PasswordSalt = New-Object byte[] 16
$saltGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
try { $saltGenerator.GetBytes($script:PasswordSalt) } finally { $saltGenerator.Dispose() }
$passwordBytes = Get-BytesFromSecureString $passwordSecure
$script:PasswordHash = Get-PasswordHash $passwordBytes $script:PasswordSalt
[Array]::Clear($passwordBytes, 0, $passwordBytes.Length)
$passwordSecure.Dispose()
$passwordSecure = $null

$listener = [Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:4173/")
try {
  $listener.Start()
} catch {
  throw "Nie udalo sie uruchomic serwera na http://127.0.0.1:4173/. Zamknij inny serwer uzywajacy portu 4173 albo uruchom skrypt ponownie. Szczegoly: $($_.Exception.Message)"
}

Write-Host "Panel Tarcza dziala pod adresem http://127.0.0.1:4173/"
Write-Host "Zatrzymaj serwer kombinacja Ctrl+C. Sesje pracownicze wygasna po 8 godzinach lub restarcie serwera."
Start-Process "http://127.0.0.1:4173/"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      if ($context.Request.Url.AbsolutePath.StartsWith("/api/employee/")) {
        Invoke-ApiRequest $context
      } else {
        Invoke-StaticRequest $context
      }
    } catch {
      [Console]::Error.WriteLine("Blad obslugi zadania HTTP: $($_.Exception.Message)")
      try { $context.Response.Abort() } catch {}
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
  [Array]::Clear($script:PasswordHash, 0, $script:PasswordHash.Length)
  [Array]::Clear($script:PasswordSalt, 0, $script:PasswordSalt.Length)
  $script:Sessions.Clear()
}
