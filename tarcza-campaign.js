(() => {
  const main = document.querySelector("main");
  const updatesKey = "tarcza-updates-red-blue-2026-10";

  const style = document.createElement("style");
  style.textContent = `
    main.tarcza-campaign-main { position: relative; isolation: isolate; }
    main.tarcza-campaign-claim > .intro {
      max-width: min(730px, calc(100% - clamp(250px, 38vw, 460px) - 32px));
    }
    main.tarcza-campaign-policies > .intro {
      max-width: min(730px, calc(100% - clamp(250px, 38vw, 460px) - 32px));
    }
    .tarcza-campaign {
      position: absolute;
      z-index: -1;
      top: 0;
      right: 0;
      width: clamp(250px, 38vw, 460px);
      pointer-events: none;
      user-select: none;
    }
    .tarcza-campaign-figure {
      display: block;
      width: 100%;
      height: auto;
      opacity: 1;
      filter: drop-shadow(0 22px 48px #a541e977) saturate(1.08) contrast(1.03);
      object-fit: contain;
    }
    .tarcza-campaign-endorsement {
      display: block;
      width: 100%;
      margin-top: 8px;
      color: white;
      font: italic 700 clamp(22px, 2.6vw, 34px)/1.1 "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
      letter-spacing: -.045em;
      text-align: center;
      text-shadow: 0 2px 12px #1a071bcc, 0 1px 3px #1a071b;
    }
    @media (max-width: 700px) {
      .tarcza-campaign {
        top: 6px;
        right: -7px;
        width: clamp(190px, 54vw, 260px);
      }
      .tarcza-campaign-endorsement {
        font-size: clamp(20px, 6vw, 27px);
      }
    }
    @media (max-width: 760px) {
      main.tarcza-campaign-claim > .intro {
        max-width: none;
        padding-top: calc(clamp(190px, 54vw, 260px) * .667 + 48px);
      }
      main.tarcza-campaign-policies > .intro {
        max-width: none;
        padding-top: calc(clamp(190px, 54vw, 260px) * .667 + 48px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .tarcza-campaign-figure { filter: none; }
    }
  `;
  document.head.append(style);

  let updatesSeen = false;
  try {
    updatesSeen = localStorage.getItem(updatesKey) === "shown";
  } catch (error) {
    console.error("Nie udało się odczytać zapamiętanego ekranu zmian.", error);
  }

  if (!updatesSeen) {
    const dialog = document.createElement("dialog");
    dialog.className = "tarcza-updates-dialog";
    dialog.setAttribute("aria-labelledby", "tarcza-updates-title");
    dialog.innerHTML = `
      <div class="tarcza-updates-content">
        <p class="tarcza-updates-eyebrow">Aktualizacja Tarczy</p>
        <h2 id="tarcza-updates-title">Co nowego?</h2>
        <ol>
          <li><strong>Czerwono-niebieski wygląd</strong> — nowa paleta kolorów na wszystkich stronach.</li>
          <li><strong>Zdjęcia na różnych stronach</strong> — osobne fotografie na stronie głównej, w zgłoszeniu szkody i w polisach.</li>
          <li><strong>„Masiuk poleca”</strong> — elegancki podpis umieszczony pod zdjęciem.</li>
          <li><strong>Poprawiony układ</strong> — zdjęcia i nagłówki mają teraz własną przestrzeń.</li>
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
  }

  const imageSource = main?.dataset.campaignImage;
  if (!main || !imageSource) return;
  main.classList.add("tarcza-campaign-main");
  if (main.querySelector("#claimForm")) main.classList.add("tarcza-campaign-claim");
  if (main.querySelector(".policy-section")) main.classList.add("tarcza-campaign-policies");

  const campaign = document.createElement("div");
  campaign.className = "tarcza-campaign";

  const figure = document.createElement("img");
  figure.className = "tarcza-campaign-figure";
  figure.src = imageSource;
  figure.alt = "";
  figure.setAttribute("aria-hidden", "true");
  figure.draggable = false;
  campaign.append(figure);

  const endorsement = document.createElement("span");
  endorsement.className = "tarcza-campaign-endorsement";
  endorsement.textContent = "Masiuk poleca";
  campaign.append(endorsement);
  main.prepend(campaign);
})();
