// js/integrations/spotify_radio_hook.js
// Web Playback SDK controller (Play/Pause/Next/Volume + Now Playing callback)

const SDK_SRC = "https://sdk.scdn.co/spotify-player.js";

/* ---------------------------
   Preload (optional)
--------------------------- */
export function preloadSpotifySDK(){
  if (window.Spotify) return;
  if (document.querySelector(`script[src="${SDK_SRC}"]`)) return;

  const s = document.createElement("script");
  s.src = SDK_SRC;
  s.async = true;
  document.head.appendChild(s);
}

/* ---------------------------
   Load SDK safely (define callback first)
--------------------------- */
function loadSpotifySDK() {
  return new Promise((resolve, reject) => {
    if (window.Spotify) return resolve();

    // Define callback BEFORE script executes (prevents "onSpotifyWebPlaybackSDKReady not defined")
    const prev = window.onSpotifyWebPlaybackSDKReady;
    window.onSpotifyWebPlaybackSDKReady = () => {
      try { if (typeof prev === "function") prev(); } catch {}
      resolve();
    };

    // If script already injected (maybe via preloadSpotifySDK), just wait
    if (document.querySelector(`script[src="${SDK_SRC}"]`)) return;

    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Spotify SDK"));
    document.head.appendChild(s);
  });
}

async function ensureSpotifyObject(timeoutMs = 15000){
  const start = Date.now();
  while (!window.Spotify) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Spotify SDK loaded but window.Spotify missing");
    }
    await new Promise(r => setTimeout(r, 50));
  }
}

/* ---------------------------
   Web API helper
--------------------------- */
async function spotifyFetch(token, path, { method = "GET", body } = {}) {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

/* ---------------------------
   Main controller
--------------------------- */
export async function createSpotifyRadioController({
  getAccessToken,
  playlistUri,
  playerName = "Valentines Radio",
  initialVolume = 0.3,
  onSongChange = () => {},
  onError = (e) => console.warn("[spotify]", e)
} = {}) {
  if (!getAccessToken) throw new Error("getAccessToken required");
  if (!playlistUri) throw new Error("playlistUri required");

  await loadSpotifySDK();
  await ensureSpotifyObject();

  const player = new window.Spotify.Player({
    name: playerName,
    getOAuthToken: async (cb) => {
      try { cb(await getAccessToken()); }
      catch (e) { onError(e); }
    },
    volume: initialVolume
  });

  let deviceId = null;
  let startedContext = false; // ✅ FIX: define it

  // Wait for device id
  let resolveReady;
  const readyPromise = new Promise((res) => (resolveReady = res));

  player.addListener("ready", ({ device_id }) => {
    deviceId = device_id;
    resolveReady?.(device_id);
  });

  player.addListener("player_state_changed", (state) => {
    if (!state) return;
    const t = state.track_window?.current_track;
    if (!t) return;
    const artist = (t.artists || []).map(a => a.name).join(", ");
    onSongChange(artist ? `${t.name} — ${artist}` : t.name);
  });

  // errors
  player.addListener("initialization_error", ({ message }) => onError(new Error(message)));
  player.addListener("authentication_error", ({ message }) => onError(new Error(message)));
  player.addListener("account_error", ({ message }) => onError(new Error(message)));
  player.addListener("playback_error", ({ message }) => onError(new Error(message)));

  await player.connect();

  async function ensurePlaylistLoadedAndPlaying() {
    const token = await getAccessToken();

    // Wait until the SDK player is ready and has a deviceId
    await readyPromise;
    if (!deviceId) throw new Error("Spotify device not ready yet");

    // Transfer playback to this browser device
    await spotifyFetch(token, "/me/player", {
      method: "PUT",
      body: { device_ids: [deviceId], play: false }
    });

    // Start playlist at track #1 explicitly
    await spotifyFetch(token, `/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method: "PUT",
      body: {
        context_uri: playlistUri,
        offset: { position: 0 },
        position_ms: 0
      }
    });

    startedContext = true;
  }

  return {
    async play() {
      try {
        if (!startedContext) {
          await ensurePlaylistLoadedAndPlaying();
          return; // ✅ avoid double-start
        }
        await player.resume();
      } catch (e) { onError(e); }
    },

    async pause() {
      try { await player.pause(); } catch (e) { onError(e); }
    },

    async next() {
      try { await player.nextTrack(); } catch (e) { onError(e); }
    },

    async setVolume(v01) {
      try { await player.setVolume(Math.max(0, Math.min(1, v01))); }
      catch (e) { onError(e); }
    },

    destroy() {
      try { player.disconnect(); } catch {}
    }
  };
}
