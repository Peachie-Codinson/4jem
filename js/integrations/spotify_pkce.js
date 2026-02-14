// js/integrations/spotify_pkce.js
// Minimal PKCE auth helper for Spotify Web API.
// You MUST register your redirect URI in Spotify Developer Dashboard.

const AUTH_BASE = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";

const LS_TOKEN = "sp_token";
const LS_VERIFIER = "sp_pkce_verifier";

function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function randomString(len = 64) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

async function sha256(str) {
  const data = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

function nowSec() { return Math.floor(Date.now() / 1000); }

function saveToken(t) {
  localStorage.setItem(LS_TOKEN, JSON.stringify(t));
}

function loadToken() {
  try { return JSON.parse(localStorage.getItem(LS_TOKEN) || "null"); }
  catch { return null; }
}

function isExpired(t) {
  if (!t?.expires_at) return true;
  return nowSec() >= t.expires_at - 20; // small skew
}

async function refreshToken({ clientId, refresh_token }) {
  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("client_id", clientId);
  body.set("refresh_token", refresh_token);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || "refresh_token failed");

  const token = {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refresh_token,
    scope: data.scope,
    token_type: data.token_type,
    expires_at: nowSec() + (data.expires_in || 3600)
  };
  saveToken(token);
  return token;
}

async function exchangeCodeForToken({ clientId, redirectUri, code }) {
  const verifier = localStorage.getItem(LS_VERIFIER);
  if (!verifier) throw new Error("Missing PKCE verifier");

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", clientId);
  body.set("code", code);
  body.set("redirect_uri", redirectUri);
  body.set("code_verifier", verifier);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_description || "token exchange failed");

  const token = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    scope: data.scope,
    token_type: data.token_type,
    expires_at: nowSec() + (data.expires_in || 3600)
  };
  saveToken(token);
  localStorage.removeItem(LS_VERIFIER);
  return token;
}

export async function spotifyHandleRedirect({ clientId, redirectUri }) {
  // Call on page load; if URL has ?code=..., exchange it then clean URL
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const err = url.searchParams.get("error");
  if (err) throw new Error(err);
  if (!code) return null;

  const token = await exchangeCodeForToken({ clientId, redirectUri, code });

  // clean URL
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());
  return token;
}

export async function spotifyLoginPkce({
  clientId,
  redirectUri,
  scopes = []
}) {
  const verifier = randomString(64);
  localStorage.setItem(LS_VERIFIER, verifier);

  const challenge = b64url(await sha256(verifier));

  const state = randomString(16);

  const url = new URL(AUTH_BASE);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", scopes.join(" "));

  window.location.href = url.toString();
}

export async function spotifyGetAccessToken({ clientId }) {
  const t = loadToken();
  if (!t) return null;
  if (!isExpired(t)) return t.access_token;
  // refresh
  const nt = await refreshToken({ clientId, refresh_token: t.refresh_token });
  return nt.access_token;
}

export function spotifyLogout() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_VERIFIER);
}

export function spotifyHasToken() {
  const t = loadToken();
  return !!t?.access_token;
}
