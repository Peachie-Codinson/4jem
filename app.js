// app.js
const pile = document.getElementById('pile');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const modalTitle = document.getElementById('modalTitle');
const modalTag = document.getElementById('modalTag');
const modalBody = document.getElementById('modalBody');
import { spotifyHandleRedirect, spotifyLoginPkce, spotifyGetAccessToken, spotifyHasToken } from "./js/integrations/spotify_pkce.js";

// ====== CONFIG YOU MUST SET ======
import { preloadSpotifySDK } from "./integrations/spotify_radio_hook.js";
import { spotifyHandleRedirect } from "./integrations/spotify_pkce.js";

preloadSpotifySDK(); // start downloading ASAP
const SPOTIFY_CLIENT_ID = "60f7afb18306420d9a44530a5cff6121";
const SPOTIFY_REDIRECT_URI = SPOTIFY_REDIRECT_URI
// also handle redirect ASAP so token is ready:
await spotifyHandleRedirect({ clientId: SPOTIFY_CLIENT_ID, redirectUri: SPOTIFY_REDIRECT_URI });

// Inject icon SVG stubs into each item
for (const el of document.querySelectorAll('.svg[data-icon]')) {
  const key = el.getAttribute('data-icon');
  el.innerHTML = (window.ICONS && window.ICONS[key]) ? window.ICONS[key] : '';
}

// activity stubs (replace later)
const ACTIVITY_COPY = {
  radio: {
    title: "Radio",
    body: `
      <p><strong>Radio activity</strong> goes here.</p>
      <div class="placeholder">Stub: playlist, “tune the dial” mini-game, or voice note player.</div>
    `
  },
  book: {
    title: "Almanac",
    body: `
      <p><strong>Almanac / book activity</strong> goes here.</p>
      <div class="placeholder">Stub: flip pages, daily horoscope, trivia, or a memory journal prompt.</div>
    `
  },
  bouquet: {
    title: "Bouquet",
    body: `
      <p><strong>Bouquet activity</strong> goes here.</p>
      <div class="placeholder">Stub: arrange flowers, pick colors, drag petals into a vase.</div>
    `
  },
  chocolates: {
  title: "Chocolate Box",
  body: `
    <div class="choco-activity" id="chocoActivity">
      <div class="choco-title">Things I like about you</div>

      <div class="heart-box" id="heartBox" data-open="false">
        <!-- Base heart (box bottom) -->
<svg class="heart-svg heart-base" viewBox="0 0 380 380" aria-hidden="true">
  <path d="M190 336
           C 165 312, 64 246, 64 156
           C 64 110, 96 78, 142 78
           C 165 78, 182 90, 190 104
           C 198 90, 215 78, 238 78
           C 284 78, 316 110, 316 156
           C 316 246, 215 312, 190 336 Z"
        fill="rgba(92, 46, 64, .92)"          /* deep cocoa box */
        stroke="rgba(42,31,42,.22)"
        stroke-width="4"
        stroke-linejoin="round"/>
  <!-- inner rim to sell "box" look -->
  <path d="M190 318
           C 168 297, 84 239, 84 162
           C 84 124, 110 98, 148 98
           C 170 98, 182 110, 190 124
           C 198 110, 210 98, 232 98
           C 270 98, 296 124, 296 162
           C 296 239, 212 297, 190 318 Z"
        fill="rgba(255, 240, 247, .25)"
        stroke="rgba(255, 240, 247, .28)"
        stroke-width="2"
        stroke-linejoin="round"/>
</svg>


        <!-- Chocolates (appear when open) -->
        <div class="choco-grid" id="chocoGrid">
          <button class="choco" data-flavor="Strawberry Ganache" data-note="You make ordinary moments feel special.">🍓</button>
          <button class="choco" data-flavor="Salted Caramel" data-note="I love your warmth — it’s the best kind of comfort.">🧂</button>
          <button class="choco" data-flavor="Hazelnut Praline" data-note="You’re effortlessly thoughtful in the little things.">🌰</button>
          <button class="choco" data-flavor="Dark Chocolate" data-note="I admire your strength and how you keep going.">🍫</button>
          <button class="choco" data-flavor="Vanilla Cream" data-note="Your presence feels calm and safe.">🍦</button>
          <button class="choco" data-flavor="Matcha Truffle" data-note="Your curiosity is cute — and contagious.">🍵</button>
          <button class="choco" data-flavor="Raspberry Heart" data-note="I love how you laugh — it’s my favorite sound.">💗</button>
          <button class="choco" data-flavor="Cookies & Cream" data-note="You’re fun. Like, genuinely fun to be around.">🍪</button>
        </div>

        <button class="heart-lid" id="heartLid" type="button" aria-label="Open chocolate box lid">
  <svg class="heart-svg" viewBox="0 0 380 380" aria-hidden="true">
    <path d="M190 336
             C 165 312, 64 246, 64 156
             C 64 110, 96 78, 142 78
             C 165 78, 182 90, 190 104
             C 198 90, 215 78, 238 78
             C 284 78, 316 110, 316 156
             C 316 246, 215 312, 190 336 Z"
          fill="rgba(255, 85, 140, .92)"     /* strawberry lid */
          stroke="rgba(42,31,42,.22)"
          stroke-width="4"
          stroke-linejoin="round"/>
    <!-- subtle highlight -->
    <path d="M120 120 C 120 95, 150 85, 175 95"
          fill="none"
          stroke="rgba(255,255,255,.35)"
          stroke-width="6"
          stroke-linecap="round"/>
  </svg>

  <div class="lid-text">
    tap to open
    <span class="lid-hint">♡</span>
  </div>
</button>

      </div>

      <div class="note-panel" id="notePanel" aria-live="polite">
        <div class="note-heading">Pick a chocolate</div>
        <div class="note-body">Open the lid, then tap a chocolate to reveal its note and flavor.</div>
      </div>
    </div>
  `
}
,
  card: {
    title: "Card",
    body: `
      <p><strong>Card activity</strong> goes here.</p>
      <div class="placeholder">Stub: write a message, stamp a sticker, or generate a cute poem.</div>
    `
  }
};

// z-index bump on interact
let topZ = 10;
function bringToFront(el){
  topZ += 1;
  el.style.zIndex = String(topZ);
}

// modal open/close
function openActivity(key){
  const data = ACTIVITY_COPY[key] || { title: "Activity", body: `<div class="placeholder">Unknown activity stub.</div>` };
  modalTitle.textContent = data.title;
  modalTag.textContent = key;
  modalBody.innerHTML = data.body;
  overlay.classList.add('open');
  if (key === "chocolates") initChocolateActivity();
  closeBtn.focus({ preventScroll:true });
}
function closeActivity(){
  overlay.classList.remove('open');
}
function initChocolateActivity(){
  const box = document.getElementById('heartBox');
  const lid = document.getElementById('heartLid');
  const notePanel = document.getElementById('notePanel');

  if (!box || !lid || !notePanel) return;

  const openBox = () => box.setAttribute('data-open', 'true');
  const toggleBox = () => {
    const isOpen = box.getAttribute('data-open') === 'true';
    box.setAttribute('data-open', isOpen ? 'false' : 'true');
  };

  lid.addEventListener('click', (e) => {
    e.preventDefault();
    toggleBox();
  });

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.choco');
    if (!btn) return;

    // If they tap a chocolate while closed, open first
    openBox();

    const flavor = btn.dataset.flavor || "Chocolate";
    const note = btn.dataset.note || "(note placeholder)";

    notePanel.innerHTML = `
      <div class="note-heading">A little note ♡</div>
      <div class="note-flavor">${flavor}</div>
      <div class="note-body">${note}</div>
    `;
  });
}

closeBtn.addEventListener('click', closeActivity);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeActivity();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeActivity();
});

// dragging state
let draggingEl = null;
let pointerId = null;
let startX = 0, startY = 0;
let startLeft = 0, startTop = 0;
let moved = false;

function px(n){ return `${n}px`; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

pile.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.item');
  if (!el) return;

  bringToFront(el);

  draggingEl = el;
  pointerId = e.pointerId;
  draggingEl.setPointerCapture(pointerId);

  const rect = pile.getBoundingClientRect();
  const elRect = draggingEl.getBoundingClientRect();

  startX = e.clientX;
  startY = e.clientY;

  startLeft = elRect.left - rect.left;
  startTop  = elRect.top  - rect.top;

  moved = false;
});

pile.addEventListener('pointermove', (e) => {
  if (!draggingEl || e.pointerId !== pointerId) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;

  const rect = pile.getBoundingClientRect();
  const maxLeft = rect.width - draggingEl.offsetWidth;
  const maxTop  = rect.height - draggingEl.offsetHeight;

  const nextLeft = clamp(startLeft + dx, 0, maxLeft);
  const nextTop  = clamp(startTop  + dy, 0, maxTop);

  draggingEl.style.left = px(nextLeft);
  draggingEl.style.top  = px(nextTop);
});

pile.addEventListener('pointerup', (e) => {
  if (!draggingEl || e.pointerId !== pointerId) return;

  draggingEl.releasePointerCapture(pointerId);

  // treat as click if it wasn't really dragged
  if (!moved) {
    openActivity(draggingEl.dataset.activity);
  }

  draggingEl = null;
  pointerId = null;
});

pile.addEventListener('pointercancel', () => {
  draggingEl = null;
  pointerId = null;
});
