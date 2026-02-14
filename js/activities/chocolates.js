const LID_IMAGE_URL = "./assets/chocolate-box.png"; 




export function renderChocolateActivity() {
  return `
    <div class="choco-activity" id="chocoActivity">

      <div class="heart-box" id="heartBox" data-open="false">
        <!-- Base heart (box bottom) -->
        <svg class="heart-svg heart-base" viewBox="0 0 380 380" aria-hidden="true">
        <path d="M190 340
   C 158 312, 46 246, 46 150
   C 46 104, 86 72, 142 72
   C 168 72, 184 88, 190 104
   C 196 88, 212 72, 238 72
   C 294 72, 334 104, 334 150
   C 334 246, 222 312, 190 340 Z"

                fill="#3b231a"              /* dark chocolate tray */
                stroke="#d4af37"            /* gold trim */
                stroke-width="5"
                stroke-linejoin="round"/>

        <!-- inner rim -->
        <path d="M190 323
   C 162 299, 64 244, 64 156
   C 64 122, 98 96, 148 96
   C 170 96, 184 110, 190 124
   C 196 110, 210 96, 232 96
   C 282 96, 316 122, 316 156
   C 316 244, 218 299, 190 323 Z"


                fill="#2a1610"
                stroke="rgba(255,215,120,.35)"
                stroke-width="2.5"
                stroke-linejoin="round"/>
        </svg>


        <!-- Chocolates -->
<div class="choco-grid" id="chocoGrid">
  <!-- Row 1 (3) -->
  <button class="choco"
    data-flavor="Strawberry Ganache"
    data-note="I love your baby face and those round cheeks so much I kinda wanna take a bite <3">🍓</button>

  <button class="choco"
    data-flavor="Salted Caramel"
    data-note="I love how you remember tiny tidbits about my life + my interests. (I’d love it even more if you were a little more well-versed though   )">🧂</button>

  <button class="choco"
    data-flavor="Hazelnut Praline"
    data-note="I love your beautiful wolfcut, and the relentless Freudian joke about trying to look like my mom">🌰</button>

  <!-- Row 2 (3) -->
  <button class="choco"
    data-flavor="Dark Chocolate"
    data-note="I love your freaky side. I love how you can tease and bounce off my dirty jokes.">🍫</button>

  <button class="choco"
    data-flavor="Vanilla Cream"
    data-note="I love your voice and the way you speak, and the endless barrage of brainrot. Not funny.">🍦</button>

  <button class="choco"
    data-flavor="Matcha Truffle"
    data-note="I love our weird dynamic. I’m relieved and really glad we can keep talking like before.">🍵</button>

  <!-- Row 3: only middle (left/right are empty placeholders) -->
  <div class="choco-empty" aria-hidden="true"></div>

  <button class="choco choco-main"
    data-flavor="Golden Heart Truffle"
    data-note="I love everything about you.♡">💛</button>

  <div class="choco-empty" aria-hidden="true"></div>
</div>

</div>


  <!-- Lid (your image clipped to the heart) -->
<button class="heart-lid" id="heartLid" type="button" aria-label="Open chocolate box lid">
  <svg class="heart-svg" viewBox="0 0 380 380" aria-hidden="true">
    <defs>
      <clipPath id="heartClipLid">
        <path d="M190 340
                 C 158 312, 46 246, 46 150
                 C 46 104, 86 72, 142 72
                 C 168 72, 184 88, 190 104
                 C 196 88, 212 72, 238 72
                 C 294 72, 334 104, 334 150
                 C 334 246, 222 312, 190 340 Z"/>
      </clipPath>
    </defs>

    <!-- The image itself -->
    <image href="${LID_IMAGE_URL}"
           x="0" y="0" width="380" height="380"
           preserveAspectRatio="xMidYMid slice"
           clip-path="url(#heartClipLid)"></image>

    <path d="M190 340
             C 158 312, 46 246, 46 150
             C 46 104, 86 72, 142 72
             C 168 72, 184 88, 190 104
             C 196 88, 212 72, 238 72
             C 294 72, 334 104, 334 150
             C 334 246, 222 312, 190 340 Z"
          fill="none"
          stroke="#d4af37"
          stroke-width="5"
          stroke-linejoin="round"/>
  </svg>

  <div class="lid-text">
    <span class="lid-hint">♡</span>
  </div>
</button>

            </svg>


        
          </div>
        </button>
      </div>

      <div class="note-panel" id="notePanel" aria-live="polite">
        <div class="note-heading">Pick a chocolate</div>
        <div class="note-body">Open the lid, then tap a chocolate to reveal its note and flavor.</div>
      </div>
    </div>
  `;
}

export function initChocolateActivity(root = document) {
  const box = root.getElementById('heartBox');
  const lid = root.getElementById('heartLid');
  const notePanel = root.getElementById('notePanel');

  let lidRemoved = false;

  if (!box || !lid || !notePanel) return;

  const openBox = () => box.setAttribute('data-open', 'true');
  const toggleBox = () => {
    const isOpen = box.getAttribute('data-open') === 'true';
    box.setAttribute('data-open', isOpen ? 'false' : 'true');
  };

  lid.addEventListener('click', (e) => {
  e.preventDefault();
  if (lidRemoved) return;
  lidRemoved = true;

  // open box immediately so chocolates become clickable
  box.setAttribute('data-open', 'true');

  // animate lid away, then remove from DOM
  lid.classList.add('is-flying');

  const removeNow = () => {
    if (lid && lid.isConnected) lid.remove();
  };

  // remove after animation; fallback timeout in case of missed event
  lid.addEventListener('animationend', removeNow, { once: true });
  setTimeout(removeNow, 450);
});

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.choco');
    if (!btn) return;

    openBox();

    const flavor = btn.dataset.flavor || 'Chocolate';
    const note = btn.dataset.note || '(note placeholder)';

    notePanel.innerHTML = `
      <div class="note-heading">A little note ♡</div>
      <div class="note-flavor">${flavor}</div>
      <div class="note-body">${note}</div>
    `;
  });
}
