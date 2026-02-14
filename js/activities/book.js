// js/activities/book.js
// Almanac flipbook: left = info, right = image

const FLOWERS = [
  {
    name: "White clover",
    scientific: "Trifolium repens",
    meaning: "Remember me",
    note: "For I'd wither away if you forget",
    image: "./assets/white_clover_flower.jpg"
  },{
    name: "Yellow Hyacinth",
    scientific: "Hyacinthus orientalis",
    meaning: "Jealousy , sorrow",
    note: "For all my envy, I have wished for your love for too long.",
    image: "./assets/lead.jpg"
  },
  {
    name: "Aster",
    scientific: "Symphyotrichum",
    meaning: "Love, devotion, patience",
    note: "Represent the lengths of my yearning and my unwavering love.",
    image: "./assets/aster.jpg"
  },
  {
    name: "Forget-me-not",
    scientific: "Myosotis",
    meaning: "Endurance, faith, true love",
    note: "And I also hope your love lasts.",
    image: "./assets/Forget-Me-Not.jpg"
  },
  {
    name: "Cleome",
    scientific: "Cleome hassleriana",
    meaning: "Elope with Me",
    note: "I want you to be with me forever.",
    image: "./assets/cleome.jpg"
  },
  
  // add more...
];

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSpread(f) {
  return `
    <div class="almanac-spread" aria-label="Almanac pages">
      <article class="almanac-page left" aria-label="Flower information">
        <section class="almanac-head">
          <h1 class="almanac-title">${esc(f.name)}</h1>
          <div class="almanac-sub">${esc(f.scientific)}</div>
        </section>
        <section class="almanac-section" aria-label="Meaning">
          <h3 class="almanac-section-title">Meaning</h3>
          <p class="almanac-section-body">${esc(f.meaning)}</p>
        </section>

        <section class="almanac-section" aria-label="Note">
          <h3 class="almanac-section-title">Note</h3>
          <p class="almanac-section-body">${esc(f.note)}</p>
        </section>
      </article>


      <figure class="almanac-page right" aria-label="Flower image">
        <img class="almanac-img" alt="${esc(f.name)} flower" src="${esc(f.image)}" loading="lazy" />
        <figcaption class="almanac-caption">${esc(f.name)}</figcaption>
      </figure>

      <!-- flip overlay for animation -->
      <div class="almanac-flip" aria-hidden="true"></div>

      <!-- natural flipping: tap edges -->
      <div class="almanac-tap left" aria-label="Previous page" role="button" tabindex="0"></div>
      <div class="almanac-tap right" aria-label="Next page" role="button" tabindex="0"></div>
    </div>
  `;
}

export function renderBookActivity() {
  const f0 = FLOWERS[0] || {
    name: "Almanac",
    scientific: "",
    meaning: "",
    note: "",
    image: ""
  };

  return `
    <div class="almanac">
      <div class="almanac-frame">

        <div class="almanac-body" id="almBody">
          ${renderSpread(f0)}
        </div>

      </div>
    </div>
  `;
}

export function initBookActivity(root = document) {
  const indexEl = root.getElementById("almIndex");
  const body = root.getElementById("almBody");

  let i = 0;
  let flipping = false;

  function setIndexText() {
    if (!indexEl) return;
    const total = Math.max(1, FLOWERS.length);
    indexEl.textContent = `${Math.min(i + 1, total)} / ${total}`;
  }

  function doFlip(direction /* "next" | "prev" */) {
    if (!body || flipping) return;
    const total = FLOWERS.length;
    if (!total) return;

    const ni =
      direction === "next"
        ? (i + 1) % total
        : (i - 1 + total) % total;

    flipping = true;

    const spread = body.querySelector(".almanac-spread");
    const flip = body.querySelector(".almanac-flip");

    if (flip) {
      flip.dataset.dir = direction;
      flip.classList.remove("go");
      void flip.offsetWidth; // force reflow
      flip.classList.add("go");
    }

    setTimeout(() => {
      i = ni;
      body.innerHTML = renderSpread(FLOWERS[i]);
      setIndexText();
      wireGestures(); // re-bind after DOM swap
    }, 260);

    setTimeout(() => {
      flipping = false;
    }, 520);
  }

  function wireGestures() {
    const spread = body?.querySelector(".almanac-spread");
    if (!spread) return;

    const tapL = spread.querySelector(".almanac-tap.left");
    const tapR = spread.querySelector(".almanac-tap.right");

    // avoid stacking multiple listeners after swaps
    tapL?.replaceWith(tapL.cloneNode(true));
    tapR?.replaceWith(tapR.cloneNode(true));

    const newTapL = spread.querySelector(".almanac-tap.left");
    const newTapR = spread.querySelector(".almanac-tap.right");

    newTapL?.addEventListener("click", () => doFlip("prev"));
    newTapR?.addEventListener("click", () => doFlip("next"));

    // keyboard on tap zones too (Enter/Space)
    function tapKey(dir) {
      return (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          doFlip(dir);
        }
      };
    }
    newTapL?.addEventListener("keydown", tapKey("prev"));
    newTapR?.addEventListener("keydown", tapKey("next"));

    // swipe/drag
    let downX = null;

    spread.onpointerdown = (e) => {
      downX = e.clientX;
    };

    spread.onpointerup = (e) => {
      if (downX == null) return;
      const dx = e.clientX - downX;
      downX = null;

      if (Math.abs(dx) < 40) return;
      if (dx < 0) doFlip("next"); // swipe left
      else doFlip("prev");        // swipe right
    };
  }

  function onKey(e) {
    if (e.key === "ArrowLeft") doFlip("prev");
    if (e.key === "ArrowRight") doFlip("next");
  }
  window.addEventListener("keydown", onKey);

  setIndexText();
  wireGestures();

  return {
    destroy() {
      window.removeEventListener("keydown", onKey);
    }
  };
}
