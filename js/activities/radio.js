// js/activities/radio.js
import { renderMarqueeStrip, setMarqueeText } from "../components/marquee.js";
import { initKnob } from "../components/knob.js";
import { spotifyHandleRedirect, spotifyLoginPkce, spotifyGetAccessToken, spotifyHasToken } from "../integrations/spotify_pkce.js";
import { createSpotifyRadioController } from "../integrations/spotify_radio_hook.js";

/* ===== CONFIG (safe: client ID only, no secret) ===== */
const SPOTIFY_CLIENT_ID = "60f7afb18306420d9a44530a5cff6121";
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const PLAYLIST_URI = "spotify:playlist:0cocJFpNAR1vsBSqt90qjM";
const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state"
];
/* ================================================ */

/**
 * Replace RADIO_ART_SVG with your own vector art.
 * Keep the viewBox 0 0 360 270 to match the container.
 */
const RADIO_ART_SVG = `
<svg class="radio-art" viewBox="0 0 360 270" aria-hidden="true">
  <rect x="18" y="18" width="324" height="234" rx="28"
        fill="rgba(255,255,255,.65)" stroke="rgba(42,31,42,.16)" stroke-width="2"/>
  <path d="M38 44 C 120 10, 240 10, 322 44"
        fill="none" stroke="rgba(255,255,255,.55)" stroke-width="10" stroke-linecap="round"/>
  <rect x="44" y="52" width="272" height="64" rx="16"
        fill="rgba(20,10,20,.06)" stroke="rgba(42,31,42,.12)" stroke-width="2"/>
  <rect x="44" y="136" width="200" height="96" rx="18"
        fill="rgba(255,255,255,.45)" stroke="rgba(42,31,42,.12)" stroke-width="2"/>
  <g opacity="0.55">
    ${Array.from({length: 9}).map((_,row)=>
      Array.from({length: 16}).map((_,col)=>{
        const x = 58 + col*11;
        const y = 152 + row*9;
        return `<circle cx="${x}" cy="${y}" r="1.4" fill="rgba(42,31,42,.35)"/>`;
      }).join("")
    ).join("")}
  </g>
  <rect x="260" y="136" width="56" height="96" rx="18"
        fill="rgba(255,255,255,.45)" stroke="rgba(42,31,42,.12)" stroke-width="2"/>
</svg>
`;

export function renderRadioActivity(){
  return `
    <div class="radio-activity">
      <div class="radio-stage">
        ${RADIO_ART_SVG}

        <div class="radio-ui">
          ${renderMarqueeStrip({
            id: "radioMarquee",
            text: "NOW PLAYING: —",
            style: "--x: 50%; --y: 82px; --w: 220px; --h: 34px;"
          })}

          <button class="radio-btn" id="radioStart" style="--x: 80px; --y: 190px;" aria-label="Start">▶</button>
          <button class="radio-btn" id="radioPause" style="--x: 140px; --y: 190px;" aria-label="Pause">⏸</button>
          <button class="radio-btn" id="radioNext" style="--x: 200px; --y: 190px;" aria-label="Next track">⏭</button>

          <div class="knob" id="radioVolKnob"
               style="--x: 288px; --y: 184px;"
               role="slider" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="70" tabindex="0">
            <div class="knob-dial">
              <div class="knob-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="placeholder" id="radioHint">
        Tap ▶ to connect Spotify and start playback.
      </div>
    </div>
  `;
}

export async function initRadioActivity(root = document){
  const startBtn = root.getElementById("radioStart");
  const pauseBtn = root.getElementById("radioPause");
  const nextBtn  = root.getElementById("radioNext");
  const hintEl   = root.getElementById("radioHint");

  const ui = {
    setSong: (name) => setMarqueeText(root, "radioMarquee", name)
  };

  // Handle redirect return (?code=...) once per load (safe to call repeatedly)
  try{
    await spotifyHandleRedirect({ clientId: SPOTIFY_CLIENT_ID, redirectUri: SPOTIFY_REDIRECT_URI });
  }catch(e){
    if (hintEl) hintEl.textContent = `Spotify auth error: ${e.message}`;
  }

  let spotify = null;

    async function ensureSpotify(){
    if (spotify) return spotify;

    if (!spotifyHasToken()){
      await spotifyLoginPkce({
        clientId: SPOTIFY_CLIENT_ID,
        redirectUri: SPOTIFY_REDIRECT_URI,
        scopes: SPOTIFY_SCOPES
      });
      return null; // page will redirect
    }

    spotify = await createSpotifyRadioController({
      playlistUri: PLAYLIST_URI,
      getAccessToken: async () => {
        const t = await spotifyGetAccessToken({ clientId: SPOTIFY_CLIENT_ID });
        if (!t) throw new Error("No Spotify token. Please log in again.");
        return t;
      },
      onSongChange: (name) => ui.setSong(`NOW PLAYING: ${name}`),
      onError: (e) => { if (hintEl) hintEl.textContent = `Spotify: ${e.message}`; }
    });

    if (hintEl) hintEl.textContent = "Connected.";
    return spotify;
  }

  startBtn?.addEventListener("click", async () => {
  startBtn.disabled = true;
  try {
    const s = await ensureSpotify();
    if (s) await s.play();
  } finally {
    startBtn.disabled = false;
  }
});

  pauseBtn?.addEventListener("click", async () => {
    if (!spotify) return;
    await spotify.pause();
  });

  nextBtn?.addEventListener("click", async () => {
    if (!spotify) return;
    await spotify.next();
  });

  initKnob(root, {
    id: "radioVolKnob",
    initial: 0.70,
    onChange: async (v01) => {
      if (!spotify) return;
      await spotify.setVolume(v01);
    }
  });

  // allow modal close cleanup if you want
  return {
    ...ui,
    destroy: () => spotify?.destroy()
  };
}
