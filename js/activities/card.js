// js/activities/card.js
// Final activity: just an image container

const CARD_IMAGE = "/assets/cleome.png"; // <- change to your actual path

export function renderCardActivity(){
  return `
    <div class="card-activity">
      <figure class="card-frame" aria-label="Card image">
        <img class="card-img" src="${CARD_IMAGE}" alt="Card" loading="lazy" />
      </figure>
    </div>
  `;
}

export function initCardActivity(root = document){
  // no behavior needed
  return { destroy(){} };
}
