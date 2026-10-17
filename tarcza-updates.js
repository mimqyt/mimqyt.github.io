(() => {
  const updatesKey = "tarcza-updates-red-blue-2026-10";

  let updatesSeen = false;
  try {
    updatesSeen = localStorage.getItem(updatesKey) === "shown";
  } catch (error) {
    console.error("Nie udało się odczytać zapamiętanego ekranu zmian.", error);
  }

  if (updatesSeen) return;

  const style = document.createElement("style");
  style.textContent = `
    .tarcza-updates-dialog {
      width: min(540px, calc(100% - 32px));
      max-width: none;
      padding: 0;
      overflow: visible;
      border: 1px solid #ffffff30;
      border-radius: 24px;
      background: linear-gradient(145deg, #171a2cf5, #0c1424f5);
      color: #f4f7ff;
      box-shadow: 0 30px 100px #000a, inset 0 1px #ffffff26;
      backdrop-filter: blur(28px) saturate(150%);
    }
    .tarcza-updates-dialog::backdrop {
      background: #030611c9;
      backdrop-filter: blur(10px);
    }
    .tarcza-updates-content { padding: clamp(24px, 6vw, 38px); }
    .tarcza-updates-eyebrow {
      margin: 0 0 10px;
      color: #9fcaff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .15em;
      text-transform: uppercase;
    }
    .tarcza-updates-dialog h2 {
      margin: 0;
      font-size: clamp(28px, 6vw, 38px);
      letter-spacing: -.055em;
    }
    .tarcza-updates-dialog ol {
      display: grid;
      gap: 14px;
      margin: 24px 0 28px;
      padding-left: 22px;
      color: #c1cbe0;
    }
    .tarcza-updates-dialog li { padding-left: 5px; }
    .tarcza-updates-dialog li::marker { color: #ff6681; font-weight: 800; }
    .tarcza-updates-dialog strong { color: #fff; }
    .tarcza-updates-close {
      width: 100%;
      min-height: 48px;
      border: 1px solid #ffffff48;
      border-radius: 12px;
      background: linear-gradient(115deg, #ff3f62, #3489ff);
      color: white;
      font: inherit;
      font-weight: 750;
      cursor: pointer;
    }
    .tarcza-updates-close:focus-visible {
      outline: 3px solid #9fcaff;
      outline-offset: 3px;
    }
  `;
  document.head.append(style);

  const dialog = document.createElement("dialog");
  dialog.className = "tarcza-updates-dialog";
  dialog.setAttribute("aria-labelledby", "tarcza-updates-title");
  dialog.innerHTML = `
    <div class="tarcza-updates-content">
      <p class="tarcza-updates-eyebrow">Aktualizacja Tarczy</p>
      <h2 id="tarcza-updates-title">Co nowego?</h2>
      <ol>
        <li><strong>Czerwono-niebieski wygląd</strong> — nowa paleta kolorów na wszystkich stronach.</li>
        <li><strong>Prostsze potwierdzenie zgłoszenia</strong> — bez technicznych szczegółów przebiegu.</li>
        <li><strong>Poprawiony układ</strong> — nagłówki i elementy stron mają teraz własną przestrzeń.</li>
      </ol>
      <button class="tarcza-updates-close" type="button">Przejdź dalej</button>
    </div>
  `;
  document.body.append(dialog);

  try {
    localStorage.setItem(updatesKey, "shown");
  } catch (error) {
    console.error("Nie udało się zapamiętać wyświetlenia ekranu zmian.", error);
  }

  dialog.querySelector(".tarcza-updates-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => dialog.remove());
  dialog.showModal();
})();
