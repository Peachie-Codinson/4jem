// js/icons.js
export const ICONS = {
  radio: `
     <img class="desk-icon-img"
       src="./assets/radio.png"
       alt="Radio icon" />
  `,
  book: `
     <img class="desk-icon-img"
       src="./assets/almanac.png"
       alt="Almanac icon" />
  `,
  bouquet: `
    <svg viewBox="0 0 64 64" fill="none">
      <path d="M22 20c0-4 3-7 7-7s7 3 7 7-3 7-7 7-7-3-7-7Z" stroke="var(--stroke)" stroke-width="3"/>
      <path d="M18 28c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6Z" stroke="var(--stroke)" stroke-width="3"/>
      <path d="M30 28c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6Z" stroke="var(--stroke)" stroke-width="3"/>
      <path d="M26 34l-6 16m18-16l6 16" stroke="var(--stroke)" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 44h20l-10 10z" stroke="var(--stroke)" stroke-width="3" stroke-linejoin="round"/>
    </svg>
  `,
    chocolates: `
  <img class="desk-icon-img"
       src="./assets/chocolate-box.png"
       alt="Chocolate box icon" />
  `,
  card: `
      <img class="desk-icon-img"
       src="./assets/love_letter.png"
       alt="Love letter icon" />
  `
};

export function injectIcons(root = document){
  for (const el of root.querySelectorAll('.svg[data-icon]')) {
    const key = el.getAttribute('data-icon');
    el.innerHTML = ICONS[key] ?? '';
  }
}
