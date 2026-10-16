(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const internalPage = (url) =>
    url.protocol === window.location.protocol &&
    url.host === window.location.host &&
    url.pathname !== window.location.pathname &&
    /\.html?$/i.test(url.pathname);

  let navigating = false;
  let overlay = null;

  if (!reduceMotion) {
    const style = document.createElement("style");
    style.textContent = `
      .forma-transition-overlay { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; background: rgba(9, 11, 18, 0); backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); }
      .forma-transition-overlay.is-entering { animation: forma-focus-in 560ms cubic-bezier(.22,.68,0,1) both; }
      .forma-transition-overlay.is-leaving { pointer-events: auto; animation: forma-focus-out 280ms cubic-bezier(.4,0,.8,.4) both; }
      @keyframes forma-focus-in {
        from { background: rgba(9, 11, 18, .18); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); }
        to { background: rgba(9, 11, 18, 0); backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); }
      }
      @keyframes forma-focus-out {
        from { background: rgba(9, 11, 18, 0); backdrop-filter: blur(0); -webkit-backdrop-filter: blur(0); }
        to { background: rgba(9, 11, 18, .18); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); }
      }
      @media (prefers-reduced-motion: reduce) { .forma-transition-overlay { display: none !important; animation: none !important; } }
    `;
    document.head.append(style);

    function showEntrance() {
      if (overlay) overlay.remove();
      const entrance = document.createElement("div");
      entrance.className = "forma-transition-overlay";
      entrance.setAttribute("aria-hidden", "true");
      overlay = entrance;
      document.body.append(entrance);

      const finish = () => {
        entrance.remove();
        if (overlay === entrance) overlay = null;
      };
      entrance.addEventListener("animationend", finish, { once: true });
      window.setTimeout(finish, 750);
      requestAnimationFrame(() => entrance.classList.add("is-entering"));
    }

    showEntrance();

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      showEntrance();
    });
  }

  function navigate(destination) {
    const url = new URL(destination, window.location.href);
    if (!internalPage(url) || reduceMotion || navigating) {
      window.location.assign(url.href);
      return;
    }

    navigating = true;
    overlay = document.createElement("div");
    overlay.className = "forma-transition-overlay is-leaving";
    overlay.setAttribute("aria-hidden", "true");
    document.body.append(overlay);
    window.setTimeout(() => window.location.assign(url.href), 280);
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

    const url = new URL(link.href, window.location.href);
    if (!internalPage(url)) return;
    event.preventDefault();
    navigate(url.href);
  });

  window.FormaTransition = Object.freeze({ navigate });
})();
