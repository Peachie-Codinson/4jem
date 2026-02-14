// js/components/knob.js

// Maps pointer angle to value in [0,1] over a -135..+135 degree sweep.
export function initKnob(root, {
  id,
  initial = 0.7,
  onChange = () => {}
}){
  const el = root.getElementById(id);
  if (!el) return;

  let value = clamp01(initial);
  apply(value);

  let active = false;

  el.addEventListener("pointerdown", (e) => {
    active = true;
    el.setPointerCapture(e.pointerId);
    updateFromEvent(e);
  });

  el.addEventListener("pointermove", (e) => {
    if (!active) return;
    updateFromEvent(e);
  });

  el.addEventListener("pointerup", () => { active = false; });
  el.addEventListener("pointercancel", () => { active = false; });

  function updateFromEvent(e){
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // angle in degrees, where 0 points right; convert so top is -90-ish
    let ang = Math.atan2(dy, dx) * 180 / Math.PI; // -180..180
    // Clamp to our knob sweep (-135..135)
    ang = clamp(ang, -135, 135);

    // Map -135..135 to 0..1
    value = (ang + 135) / 270;

    apply(value);
    onChange(value);
  }

  function apply(v){
    // Convert value to angle for CSS rotation
    const ang = (v * 270) - 135;
    el.style.setProperty("--angle", `${ang}deg`);
    el.setAttribute("aria-valuenow", String(Math.round(v * 100)));
  }

  return {
    getValue: () => value,
    setValue: (v) => { value = clamp01(v); apply(value); onChange(value); }
  };
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function clamp01(v){ return clamp(Number(v) || 0, 0, 1); }
