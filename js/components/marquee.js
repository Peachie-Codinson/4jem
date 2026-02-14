// js/components/marquee.js

export function renderMarqueeStrip({
  id,
  text = "NOW PLAYING: —",
  style = "" // e.g. "--x: 50%; --y: 22%; --w: 260px;"
}){
  // Duplicate text so it loops seamlessly
  const safe = escapeHtml(text);
  return `
    <div class="marquee-strip" id="${id}" style="${style}">
      <div class="marquee-inner">
        <div class="marquee-text">${safe}</div>
        <div class="marquee-text">${safe}</div>
      </div>
    </div>
  `;
}

export function setMarqueeText(root, id, text){
  const strip = root.getElementById(id);
  if (!strip) return;
  const inner = strip.querySelector(".marquee-inner");
  if (!inner) return;

  const safe = escapeHtml(text);
  inner.innerHTML = `
    <div class="marquee-text">${safe}</div>
    <div class="marquee-text">${safe}</div>
  `;

  // Duration heuristic: longer text scrolls longer
  const len = (text || "").length;
  const dur = Math.max(6, Math.min(18, len * 0.22));
  strip.style.setProperty("--dur", `${dur}s`);
}

function escapeHtml(s){
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
