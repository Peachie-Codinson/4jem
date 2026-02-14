// js/modal.js
export function createModalController({
  overlayId = 'overlay',
  closeBtnId = 'closeBtn',
  titleId = 'modalTitle',
  tagId = 'modalTag',
  bodyId = 'modalBody',
} = {}) {
  const overlay = document.getElementById(overlayId);
  const closeBtn = document.getElementById(closeBtnId);
  const modalTitle = document.getElementById(titleId);
  const modalTag = document.getElementById(tagId);
  const modalBody = document.getElementById(bodyId);

  if (!overlay || !closeBtn || !modalTitle || !modalTag || !modalBody) {
    throw new Error('Modal elements not found. Check your IDs in index.html.');
  }

  function open({ title, tag, html }) {
    modalTitle.textContent = title ?? 'Activity';
    modalTag.textContent = tag ?? 'stub';
    modalBody.innerHTML = html ?? '';
    overlay.classList.add('open');
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    overlay.classList.remove('open');
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  return { open, close, overlay, modalBody };
}
