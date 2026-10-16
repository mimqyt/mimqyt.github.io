(() => {
  "use strict";

  const openers = [
    "Jasne —",
    "Już wyjaśniam:",
    "Dobre pytanie.",
    "W skrócie:",
    "Oczywiście.",
    "W tej demonstracji",
    "Najważniejsze jest to, że",
    "Spokojnie,",
    "Tutaj",
    "Dla jasności:"
  ];

  const intents = [
    {
      keywords: ["ubezpieczenie", "ochrona", "ubezpieczyciel"],
      answer: "konfigurator pozwala wybrać zakres ochrony i zobaczyć orientacyjną składkę. To demonstracja — nie zawiera prawdziwej polisy.",
      endings: ["Możesz wybrać zakres na stronie głównej.", "Wybierz rodzaj ochrony w konfiguratorze.", "Składka jest orientacyjna i nie stanowi oferty.", "Żeby przejść dalej, użyj przycisku podsumowania.", "Jeśli podasz rodzaj ochrony, dopowiem więcej."]
    },
    {
      keywords: ["oc", "ac", "samochod", "auto", "pojazd"],
      answer: "sekcja samochodowa pozwala zaznaczyć OC i AC. Wyświetlona cena jest orientacyjna, a zakres nie tworzy rzeczywistej umowy.",
      endings: ["Zakres ustawisz w konfiguratorze samochodowym.", "Możesz zaznaczyć OC, AC lub oba warianty.", "Zobacz podsumowanie, aby sprawdzić wybrane opcje.", "Końcowe warunki wymagałyby potwierdzenia u ubezpieczyciela.", "W razie potrzeby opisz, jakiej ochrony auta szukasz."]
    },
    {
      keywords: ["podroz", "wyjazd", "wakacje", "turystyczn"],
      answer: "ochronę podróżną możesz wybrać w konfiguratorze. Ta strona pokazuje tylko orientacyjny zakres i składkę.",
      endings: ["Podaj kierunek i rodzaj wyjazdu, a podpowiem, czego szukać.", "Wybierz podróż w sekcji rodzajów ochrony.", "Pamiętaj, że to nie jest zawarta polisa.", "Sprawdź dostępne opcje w konfiguratorze.", "Zakres ostatecznej ochrony wymagałby potwierdzenia."]
    },
    {
      keywords: ["dom", "mieszkan", "nieruchom", "mienie"],
      answer: "ochronę domu lub mieszkania wybiera się w konfiguratorze. Widoczna składka ma charakter orientacyjny.",
      endings: ["Wybierz kategorię domu lub mieszkania, aby zobaczyć opcje.", "Zakres możesz dopasować przed podsumowaniem.", "To demonstracja, a nie aktywna umowa ubezpieczenia.", "Szczegóły prawdziwej polisy należałoby potwierdzić z ubezpieczycielem.", "Możesz sprawdzić opcje na stronie głównej."]
    },
    {
      keywords: ["zdrow", "nnw", "zycie", "medyczn"],
      answer: "ochronę zdrowia, NNW lub życia możesz przejrzeć w konfiguratorze. Przedstawione informacje i ceny są przykładowe.",
      endings: ["Wybierz odpowiednią kategorię ochrony.", "Zakres dobierzesz na stronie głównej.", "Pamiętaj, że demonstracja nie zawiera prawdziwej polisy.", "Warunki konkretnej umowy należałoby potwierdzić u ubezpieczyciela.", "Możesz rozpocząć od wyboru rodzaju ochrony."]
    },
    {
      keywords: ["zwierze", "pies", "kot", "pupil"],
      answer: "kategorię ochrony zwierzęcia znajdziesz w konfiguratorze. Składka i opcje są poglądowe.",
      endings: ["Przejdź do kategorii zwierząt na stronie głównej.", "Możesz dopasować zaznaczone opcje przed podsumowaniem.", "To nie stanowi aktywnej polisy dla pupila.", "Szczegóły prawdziwej ochrony wymagają potwierdzenia.", "Wybierz tę kategorię, aby zobaczyć dostępne opcje."]
    },
    {
      keywords: ["firma", "biznes", "dzialaln", "przedsiebior"],
      answer: "opcje dla firmy są dostępne w konfiguratorze, a ich cena jest jedynie szacunkiem na potrzeby demonstracji.",
      endings: ["Wybierz kategorię firmową na stronie głównej.", "Zakres możesz sprawdzić przed przejściem do podsumowania.", "Ta demonstracja nie zawiera zawartej umowy.", "Warunki firmowej polisy należałoby potwierdzić indywidualnie.", "Doprecyzuj, jakiej ochrony firmy szukasz."]
    },
    {
      keywords: ["cena", "koszt", "skladk", "drogo", "kwota"],
      answer: "kwota w konfiguratorze jest orientacyjna i zależy od zaznaczonych opcji. Nie jest wiążącą ofertą ubezpieczenia.",
      endings: ["Zmień zakres i zobacz, jak aktualizuje się podsumowanie.", "Szczegółową składkę należałoby potwierdzić u ubezpieczyciela.", "Cena pojawi się w podsumowaniu wybranych opcji.", "Zaliczka demonstracyjna jest wyliczana od szacowanej składki rocznej.", "Możesz wrócić do konfiguratora i zmienić wybór."]
    },
    {
      keywords: ["zaliczk", "wplac", "przedplat"],
      answer: "strona zaliczki pokazuje 20% szacowanej składki rocznej. Jej potwierdzenie jest wyłącznie lokalną symulacją.",
      endings: ["Nie są pobierane prawdziwe pieniądze.", "Użyj przycisku potwierdzenia, aby przetestować demonstrację.", "Kwotę zaliczki znajdziesz też w podsumowaniu.", "Potwierdzenie zapisuje się w tej przeglądarce.", "Nie wpisuj danych karty — formularz ich nie potrzebuje."]
    },
    {
      keywords: ["platn", "karta", "bank", "przelew", "autoryzac", "transakcj"],
      answer: "płatność działa jako demonstracja bez karty, banku ani zewnętrznego operatora. Animacja może pokazać akceptację albo odrzucenie.",
      endings: ["Nie podawaj danych karty — nie są potrzebne.", "Status symulacji zapisuje się lokalnie w przeglądarce.", "Odrzucenie można ponowić przyciskiem na stronie płatności.", "Nie jest to rzeczywista transakcja bankowa.", "Potwierdzenie nie powoduje obciążenia rachunku."]
    },
    {
      keywords: ["termin", "kalendarz", "spotkan", "godzin", "data", "woln"],
      answer: "kalendarz proponuje losowo ustalane dostępne terminy. Wybrane spotkanie jest zapisywane lokalnie w tej przeglądarce.",
      endings: ["Szare dni są niedostępne.", "Możesz wskazać wolny dzień i godzinę.", "Dostępność zależy od wybranego konsultanta.", "Rezerwacja jest demonstracyjna i lokalna.", "Zmień miesiąc lub wybierz inny dostępny dzień."]
    },
    {
      keywords: ["milo", "marcel", "floyd", "konsultant"],
      answer: "do wyboru są konsultanci Milo Henderson, Marcel Pająk i Floyd Kaczmarek.",
      endings: ["Wybierz osobę na stronie zaliczki.", "Dostępne terminy zależą od wybranego konsultanta.", "Imię konsultanta zobaczysz też przy rezerwacji.", "Spotkanie jest zapisywane tylko lokalnie.", "Możesz zmienić wybór przed potwierdzeniem terminu."]
    },
    {
      keywords: ["szkod", "odszkod", "roszczen"],
      answer: "formularz zgłoszenia szkody zapisuje dane lokalnie i przygotowuje wiadomość e-mail do wysłania.",
      endings: ["Zgłoszenie nie trafia automatycznie do ubezpieczyciela.", "Otworzy się szkic, który trzeba wysłać samodzielnie.", "Numer sprawy zobaczysz po zapisaniu formularza.", "Załączniki można dodać opcjonalnie w formularzu.", "Status demonstracyjny możesz sprawdzić w historii zgłoszeń."]
    },
    {
      keywords: ["zglos", "formularz", "histori"],
      answer: "formularz szkody znajduje się na stronie „Zgłoś szkodę”, a zapisane wpisy możesz przeglądać w lokalnej historii.",
      endings: ["Dane pozostają w tej przeglądarce.", "Wypełnij wymagane pola, aby zapisać zgłoszenie.", "Po zapisie możesz utworzyć szkic wiadomości e-mail.", "Historia zgłoszeń jest dostępna na stronie szkody.", "To lokalna demonstracja, a nie zgłoszenie do ubezpieczyciela."]
    },
    {
      keywords: ["email", "mail", "wiadom", "wyslac", "wyslij"],
      answer: "przycisk e-mail otwiera gotowy szkic zaadresowany do milozdzienicki@gmail.com.",
      endings: ["Wiadomość trzeba samodzielnie wysłać w aplikacji pocztowej.", "Strona nie wysyła e-maili automatycznie.", "Załączniki dodaj ręcznie w programie pocztowym.", "Do wysyłki musi być skonfigurowana aplikacja pocztowa.", "Sprawdź treść szkicu przed wysłaniem."]
    },
    {
      keywords: ["zalacz", "zdjec", "plik", "pdf", "dokument"],
      answer: "do zgłoszenia szkody możesz dodać zdjęcia lub dokumenty w obsługiwanych formatach i rozmiarach podanych przy polu.",
      endings: ["Załączniki zostają zapisane lokalnie w tej przeglądarce.", "Wiadomość e-mail nie dołącza plików automatycznie.", "Przed wysłaniem szkicu dodaj pliki ręcznie.", "Formularz podaje limit plików i ich rozmiaru.", "Możesz dodać załączniki w formularzu zgłoszenia."]
    },
    {
      keywords: ["dane", "prywat", "bezpiecz", "lokal", "przeglad"],
      answer: "zgłoszenia, terminy i potwierdzenia tej demonstracji są przechowywane lokalnie w przeglądarce na tym urządzeniu.",
      endings: ["Strona nie ma podłączonego systemu ubezpieczyciela.", "Nie wpisuj danych karty płatniczej.", "Wyczyszczenie danych przeglądarki może usunąć lokalną historię.", "Dane nie są automatycznie przesyłane na serwer.", "E-mail otwiera jedynie szkic w Twojej aplikacji pocztowej."]
    },
    {
      keywords: ["polis", "umowa", "zawar", "ubezpieczon"],
      answer: "strona nie zawiera prawdziwej umowy ani polisy. Pokazuje demonstracyjny wybór ochrony i podsumowanie.",
      endings: ["Nie uzyskujesz tu aktywnej ochrony ubezpieczeniowej.", "Rzeczywista umowa wymagałaby potwierdzenia u ubezpieczyciela.", "Nie traktuj podsumowania jako wiążącej oferty.", "Potwierdzenie płatności jest tylko symulacją.", "Zakres w tej witrynie ma charakter demonstracyjny."]
    },
    {
      keywords: ["zmien", "wroc", "cofn", "opcj", "wybor"],
      answer: "możesz wrócić do konfiguratora i zmienić zaznaczone opcje przed obejrzeniem podsumowania.",
      endings: ["Użyj linku „Wróć do konfiguratora”.", "Podsumowanie odzwierciedla zapisany wybór.", "Po zmianie opcji możesz przejść dalej ponownie.", "Nie musisz podawać danych karty.", "Wybór ochrony jest demonstracyjny."]
    },
    {
      keywords: ["blad", "problem", "nie dziala", "awaria", "pomoc"],
      answer: "jeśli element strony nie działa, odśwież widok i spróbuj ponownie. Dane demonstracyjne są zapisywane lokalnie.",
      endings: ["Sprawdź, czy przeglądarka nie blokuje pamięci lokalnej.", "Możesz opisać, na której stronie pojawił się problem.", "W razie błędu płatności użyj przycisku ponowienia.", "Nie podawaj danych karty w celu rozwiązania problemu.", "Odświeżenie może pomóc wczytać lokalny stan."]
    },
    {
      keywords: ["czesc", "hej", "witaj", "dzien dobry", "kim jestes"],
      answer: "jestem wirtualnym asystentem demonstracyjnej strony forma. Mogę wyjaśnić ochronę, terminy, płatność i zgłoszenia.",
      endings: ["Napisz, co chcesz sprawdzić.", "Możesz zapytać o składkę albo zaliczkę.", "Pomogę znaleźć informacje o zgłoszeniu szkody.", "Zapytaj o dostępne terminy konsultacji.", "Chętnie wyjaśnię, jak działa ta demonstracja."]
    }
  ];

  const fallbackAnswers = [
    "Nie mam dopasowanej odpowiedzi. Zapytaj o ubezpieczenie, składkę, płatność, termin albo zgłoszenie szkody.",
    "Nie udało mi się znaleźć pasującego tematu. Spróbuj użyć słowa „zaliczka”, „kalendarz” lub „szkoda”.",
    "Możesz napisać prościej, na przykład: „Jak działa płatność?” albo „Jak zgłosić szkodę?”.",
    "Nie rozpoznaję jeszcze tego pytania. Mogę pomóc w sprawie ochrony, cen, konsultantów i formularza szkody.",
    "Nie znalazłem dopasowania — spróbuj zapytać o termin rozmowy, załączniki albo e-mail."
  ];

  const normalize = (text) => text
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const responseBank = intents.flatMap((intent) =>
    openers.flatMap((opener) =>
      intent.endings.map((ending) => `${opener} ${intent.answer} ${ending}`)
    )
  );

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function getAnswer(message) {
    const words = normalize(message).split(/\s+/).filter(Boolean);
    let bestIntent = null;
    let bestScore = 0;

    for (const intent of intents) {
      const score = intent.keywords.reduce((total, keyword) => {
        const normalizedKeyword = normalize(keyword);
        return total + (words.some((word) =>
          normalizedKeyword.length < 3
            ? word === normalizedKeyword
            : word.includes(normalizedKeyword)
        ) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestIntent = intent;
        bestScore = score;
      }
    }

    return bestIntent ? randomItem(responseBank.filter((answer) => {
      return answer.includes(bestIntent.answer);
    })) : randomItem(fallbackAnswers);
  }

  const style = document.createElement("style");
  style.textContent = `
    .forma-chat-launcher { position: fixed; right: 22px; bottom: 22px; z-index: 1000; display: inline-flex; align-items: center; gap: 10px; min-height: 54px; padding: 0 19px; border: 1px solid #ffffff55; border-radius: 999px; background: linear-gradient(135deg, #a296ff, #6757ee); color: #fff; font: 700 13px/1.2 Inter, "Segoe UI", system-ui, sans-serif; box-shadow: 0 12px 36px #6554ee55, inset 0 1px #ffffff80; cursor: pointer; transition: transform .2s, box-shadow .2s; }
    .forma-chat-launcher:hover { transform: translateY(-3px); box-shadow: 0 16px 42px #6554ee70, inset 0 1px #ffffff80; }
    .forma-chat-launcher:focus-visible, .forma-chat-close:focus-visible, .forma-chat-send:focus-visible, .forma-chat-input:focus-visible { outline: 3px solid #d4ff72; outline-offset: 3px; }
    .forma-chat-launcher-icon { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 50%; background: #ffffff25; font-size: 15px; }
    .forma-chat-panel { position: fixed; right: 22px; bottom: 88px; z-index: 1000; display: flex; width: min(380px, calc(100vw - 28px)); height: min(550px, calc(100dvh - 118px)); flex-direction: column; overflow: hidden; border: 1px solid #ffffff28; border-radius: 22px; background: linear-gradient(145deg, #1a1d2bf5, #101321f5); color: #f5f6ff; font-family: Inter, "Segoe UI", system-ui, sans-serif; box-shadow: 0 28px 90px #0009, inset 0 1px #ffffff1c; backdrop-filter: blur(28px) saturate(155%); animation: forma-chat-in .2s ease-out; }
    .forma-chat-panel[hidden] { display: none; }
    .forma-chat-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 17px; border-bottom: 1px solid #ffffff17; background: linear-gradient(135deg, #a296ff1e, #ffffff04); }
    .forma-chat-brand { display: flex; align-items: center; gap: 11px; }
    .forma-chat-avatar { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 13px; background: linear-gradient(145deg, #a69aff, #6757ee); color: white; font-weight: 800; box-shadow: 0 7px 20px #7564f055; }
    .forma-chat-title { margin: 0; font-size: 14px; font-weight: 750; }
    .forma-chat-subtitle { margin: 3px 0 0; color: #b7bbce; font-size: 10px; }
    .forma-chat-close { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid #ffffff20; border-radius: 10px; background: #ffffff08; color: white; font-size: 20px; cursor: pointer; }
    .forma-chat-feed { display: flex; flex: 1; flex-direction: column; gap: 11px; overflow-y: auto; padding: 17px 14px; overscroll-behavior: contain; }
    .forma-chat-message { max-width: 88%; padding: 11px 13px; border: 1px solid #ffffff12; border-radius: 15px 15px 15px 4px; background: #ffffff0c; color: #e6e8f3; font-size: 12px; line-height: 1.55; overflow-wrap: anywhere; animation: forma-chat-in .18s ease-out; }
    .forma-chat-message.user { align-self: flex-end; border-color: #a296ff40; border-radius: 15px 15px 4px 15px; background: linear-gradient(135deg, #8879ff55, #6757ee30); color: white; }
    .forma-chat-input-row { display: flex; align-items: center; gap: 8px; padding: 12px; border-top: 1px solid #ffffff17; background: #0e101a80; }
    .forma-chat-input { flex: 1; min-width: 0; min-height: 42px; padding: 0 13px; border: 1px solid #ffffff20; border-radius: 12px; background: #ffffff09; color: white; font: 12px Inter, "Segoe UI", system-ui, sans-serif; }
    .forma-chat-input::placeholder { color: #9298ac; }
    .forma-chat-send { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border: 1px solid #ffffff40; border-radius: 12px; background: linear-gradient(135deg, #9e92ff, #7060ed); color: white; font-size: 17px; cursor: pointer; box-shadow: inset 0 1px #ffffff70; }
    .forma-chat-disclaimer { margin: 0; padding: 0 14px 11px; color: #9298ac; font-size: 9px; text-align: center; }
    @keyframes forma-chat-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 520px) {
      .forma-chat-launcher { right: 14px; bottom: 14px; min-height: 50px; }
      .forma-chat-panel { right: 10px; bottom: 74px; width: calc(100vw - 20px); height: min(560px, calc(100dvh - 88px)); }
    }
    @media (prefers-reduced-motion: reduce) {
      .forma-chat-launcher, .forma-chat-message, .forma-chat-panel { animation: none; transition: none; }
    }
  `;
  document.head.append(style);

  const launcher = document.createElement("button");
  launcher.className = "forma-chat-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "formaChatPanel");
  launcher.innerHTML = '<span class="forma-chat-launcher-icon" aria-hidden="true">✦</span><span>Porozmawiaj z nami</span>';

  const panel = document.createElement("section");
  panel.className = "forma-chat-panel";
  panel.id = "formaChatPanel";
  panel.setAttribute("aria-label", "Czat forma");
  panel.hidden = true;
  panel.innerHTML = `
    <header class="forma-chat-head">
      <div class="forma-chat-brand"><span class="forma-chat-avatar" aria-hidden="true">f</span><div><h2 class="forma-chat-title">Asystent forma</h2><p class="forma-chat-subtitle">Ponad 1000 wariantów odpowiedzi · pomoc na stronie</p></div></div>
      <button class="forma-chat-close" type="button" aria-label="Zamknij czat">×</button>
    </header>
    <div class="forma-chat-feed" id="formaChatFeed" role="log" aria-live="polite" aria-relevant="additions text"></div>
    <p class="forma-chat-disclaimer">Asystent demonstracyjny — nie zastępuje konsultanta.</p>
    <form class="forma-chat-input-row" id="formaChatForm">
      <input class="forma-chat-input" id="formaChatInput" type="text" maxlength="400" autocomplete="off" placeholder="Napisz wiadomość…" aria-label="Wiadomość do asystenta" required>
      <button class="forma-chat-send" type="submit" aria-label="Wyślij wiadomość">↑</button>
    </form>
  `;
  document.body.append(launcher, panel);

  const feed = panel.querySelector("#formaChatFeed");
  const input = panel.querySelector("#formaChatInput");

  function addMessage(text, sender) {
    const message = document.createElement("p");
    message.className = `forma-chat-message${sender === "user" ? " user" : ""}`;
    message.textContent = text;
    feed.append(message);
    feed.scrollTop = feed.scrollHeight;
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
    else launcher.focus();
  }

  addMessage("Cześć! Zapytaj mnie o ubezpieczenie, składkę, termin, płatność lub zgłoszenie szkody.", "bot");

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  panel.querySelector(".forma-chat-close").addEventListener("click", () => setOpen(false));
  panel.querySelector("#formaChatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMessage(message, "user");
    input.value = "";
    addMessage(getAnswer(message), "bot");
    input.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  window.FormaChat = Object.freeze({
    responseCount: responseBank.length,
    getAnswer
  });
})();
