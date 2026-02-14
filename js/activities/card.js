// js/activities/card.js
// Final activity: just an image container

const CARD_IMAGE = "./assets/vdaycard.png"; // <- change to your actual path

export function renderCardActivity(){
  return `
    <div class="card-activity">
      <figure class="card-frame" aria-label="Card image">
        <button class="card-zoom" id="cardZoomBtn" type="button" aria-label="Zoom card">
          <img class="card-img" src="${CARD_IMAGE}" alt="Card" loading="lazy" />
        </button>
      </figure>

      <div class="card-actions">
        <a class="card-link" href="${CARD_IMAGE}" target="_blank" rel="noopener">
          Open image (save/zoom)
        </a>
      </div>

      <!-- Lightbox -->
      <div class="card-lightbox" id="cardLightbox" aria-hidden="true">
        <div class="card-lightbox-backdrop" data-close="1"></div>
        <div class="card-lightbox-panel" role="dialog" aria-label="Card zoom view">
          <img class="card-lightbox-img" src="${CARD_IMAGE}" alt="Card zoomed" />
          <div class="card-lightbox-row">
            <a class="card-link" href="${CARD_IMAGE}" target="_blank" rel="noopener">Open in new tab</a>
            <button class="card-close" type="button" data-close="1" aria-label="Close">✕</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initCardActivity(root = document){
  const zoomBtn = root.getElementById("cardZoomBtn");
  const lb = root.getElementById("cardLightbox");

  function open() {
    if (!lb) return;
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
  }

  function close() {
    if (!lb) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
  }

  zoomBtn?.addEventListener("click", open);

  lb?.addEventListener("click", (e) => {
    if (e.target?.dataset?.close) close();
  });

  function onKey(e){
    if (e.key === "Escape") close();
  }
  window.addEventListener("keydown", onKey);

  return {
    destroy(){
      window.removeEventListener("keydown", onKey);
    }
  };
}
