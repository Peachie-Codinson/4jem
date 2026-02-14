// js/main.js
import { injectIcons } from './icons.js';
import { initDrag } from './drag.js';
import { createModalController } from './modal.js';
import { ACTIVITIES } from './activities/index.js';


injectIcons(document);

const pile = document.getElementById('pile');
const modal = createModalController();

let topZ = 10;
function bringToFront(el){
  topZ += 1;
  el.style.zIndex = String(topZ);
}

initDrag({
  containerEl: pile,
  boundsEl: pile, // pile fills the desk => movement area == desk
  onBringToFront: bringToFront
});

// When a drag ends without moving much, drag.js emits "itemclick"
pile.addEventListener('itemclick', (e) => {
  const key = e.detail.activityKey;
  const activity = ACTIVITIES[key];

  if (!activity) return;

  modal.open({
    title: activity.title,
    tag: key,
    html: activity.render()
  });

  // Important: init after HTML is injected
  activity.init(document);
});
