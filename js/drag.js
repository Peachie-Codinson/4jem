// js/drag.js
export function initDrag({
  containerEl,
  itemSelector = '.item',
  boundsEl = containerEl, // movement area
  onBringToFront = null,
} = {}) {
  if (!containerEl) throw new Error('initDrag: containerEl is required');

  let draggingEl = null;
  let pointerId = null;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;
  let moved = false;

  const px = (n) => `${n}px`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  containerEl.addEventListener('pointerdown', (e) => {
    const el = e.target.closest(itemSelector);
    if (!el) return;

    if (onBringToFront) onBringToFront(el);

    draggingEl = el;
    pointerId = e.pointerId;
    draggingEl.setPointerCapture(pointerId);

    const rect = boundsEl.getBoundingClientRect();
    const elRect = draggingEl.getBoundingClientRect();

    startX = e.clientX;
    startY = e.clientY;

    startLeft = elRect.left - rect.left;
    startTop  = elRect.top  - rect.top;

    moved = false;
    e.preventDefault();
  }, true);

  containerEl.addEventListener('pointermove', (e) => {
    if (!draggingEl || e.pointerId !== pointerId) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;

    const rect = boundsEl.getBoundingClientRect();
    const maxLeft = rect.width - draggingEl.offsetWidth;
    const maxTop  = rect.height - draggingEl.offsetHeight;

    const nextLeft = clamp(startLeft + dx, 0, maxLeft);
    const nextTop  = clamp(startTop  + dy, 0, maxTop);

    draggingEl.style.left = px(nextLeft);
    draggingEl.style.top  = px(nextTop);

    e.preventDefault();
  }, true);

  containerEl.addEventListener('pointerup', (e) => {
    if (!draggingEl || e.pointerId !== pointerId) return;

    try { draggingEl.releasePointerCapture(pointerId); } catch {}

    const clicked = !moved;
    const activityKey = draggingEl.dataset.activity;

    draggingEl = null;
    pointerId = null;

    e.preventDefault();

    // Let caller decide what “click” means
    if (clicked && activityKey) {
      containerEl.dispatchEvent(new CustomEvent('itemclick', {
        detail: { activityKey }
      }));
    }
  }, true);

  containerEl.addEventListener('pointercancel', () => {
    draggingEl = null;
    pointerId = null;
  });

  return {};
}
