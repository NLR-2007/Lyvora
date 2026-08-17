const DEFAULT_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

// The backend URL is overridable because the free ngrok tunnel rotates. It has
// to be restricted to hosts we actually deploy behind: every request carries
// the user's bearer token, so an arbitrary origin accepted here would receive
// that token and take over the account. Plain http is allowed only on loopback.
const API_HOST_ALLOWLIST = [
  /^localhost$/,
  /^127\.0\.0\.1$/,
  /(^|\.)ngrok-free\.(dev|app)$/,
  /(^|\.)ngrok\.(io|app)$/,
];

const isLoopback = (hostname) => hostname === "localhost" || hostname === "127.0.0.1";

export const isAllowedApiUrl = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback(url.hostname))) {
    return false;
  }
  try {
    if (url.host === new URL(DEFAULT_BASE_URL).host) return true;
  } catch {
    // DEFAULT_BASE_URL is malformed; fall through to the allowlist.
  }
  return API_HOST_ALLOWLIST.some((pattern) => pattern.test(url.hostname));
};

// Check for ?api=... query parameter to dynamically set backend URL
if (typeof window !== "undefined") {
  const urlParams = new URLSearchParams(window.location.search);
  const apiParam = urlParams.get("api");
  if (apiParam) {
    if (isAllowedApiUrl(apiParam)) {
      localStorage.setItem("gg_api_url", apiParam);
    } else {
      console.warn(`Ignored ?api= override for untrusted origin: ${apiParam}`);
    }
    // Clean the query parameter out of history either way.
    const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]api=[^&]+/, "").replace(/^&/, "?");
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// A value saved before this check existed, or written by another tab, is not
// trusted either — validate on read, not only on write.
const readSavedApiUrl = () => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("gg_api_url");
  if (!saved) return null;
  if (isAllowedApiUrl(saved)) return saved;
  localStorage.removeItem("gg_api_url");
  return null;
};

const savedApiUrl = readSavedApiUrl();

export let BASE_URL = (savedApiUrl || DEFAULT_BASE_URL).replace(/\/$/, "");

export const getApiUrl = () => BASE_URL;

export const setApiUrl = (url) => {
  if (url) {
    if (!isAllowedApiUrl(url)) {
      throw new Error("That backend URL is not an allowed origin.");
    }
    localStorage.setItem("gg_api_url", url);
    BASE_URL = url.replace(/\/$/, "");
  } else {
    localStorage.removeItem("gg_api_url");
    BASE_URL = DEFAULT_BASE_URL;
  }
};

// ─── Token helpers ───────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("gg_token");
export const setToken = (token) => localStorage.setItem("gg_token", token);
export const removeToken = () => localStorage.removeItem("gg_token");

export const getAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem("gg_user") || "null");
  } catch {
    return null;
  }
};
export const setAuthUser = (user) => localStorage.setItem("gg_user", JSON.stringify(user));
export const removeAuthUser = () => localStorage.removeItem("gg_user");

export const logout = () => {
  removeToken();
  removeAuthUser();
  window.location.reload();
};

// ─── Connection observers ────────────────────────────────────────────────────
// The status badge used to run its own probe against "/". That probe could fail
// on its own while every real call kept succeeding, leaving the UI reporting
// "API Offline" during a perfectly healthy session. Reachability is a property
// of actual traffic, so report it from here: any HTTP reply — including 401 or
// 404 — proves the server answered. Only a transport failure means offline.
const connectionListeners = new Set();

export const onConnectionChange = (listener) => {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
};

const reportConnection = (reachable) => {
  connectionListeners.forEach((listener) => {
    try {
      listener(reachable);
    } catch {
      // A broken listener must not take down the request it observes.
    }
  });
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const request = (baseUrl) => fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const attemptedBaseUrl = BASE_URL;
  let response;
  try {
    response = await request(attemptedBaseUrl);
  } catch {
    // ngrok free URLs commonly change. If a saved override is dead, retry the
    // configured URL and forget the stale override as soon as it responds.
    if (attemptedBaseUrl !== DEFAULT_BASE_URL) {
      try {
        response = await request(DEFAULT_BASE_URL);
        setApiUrl(null);
      } catch {
        reportConnection(false);
        throw new Error(`Cannot reach the backend at ${attemptedBaseUrl}. Check the API URL and make sure the backend and ngrok are running.`);
      }
    } else {
      reportConnection(false);
      throw new Error(`Cannot reach the backend at ${attemptedBaseUrl}. Make sure the backend is running.`);
    }
  }

  // The server answered, whatever the status code — the API is reachable.
  reportConnection(true);

  // A dead tunnel can still return a gateway response. Treat it like a stale
  // saved URL when the configured backend is available. ngrok resolves every
  // *.ngrok-free.dev name through wildcard DNS, so an expired tunnel answers
  // with 404 (ERR_NGROK_3200) instead of failing to connect — without 404 here
  // a stale override never self-heals and the app is stuck reporting Offline.
  if ([404, 502, 503, 504].includes(response.status) && attemptedBaseUrl !== DEFAULT_BASE_URL) {
    try {
      response = await request(DEFAULT_BASE_URL);
      setApiUrl(null);
    } catch {
      // Preserve the original gateway response so the normal error handling
      // below reports its status.
    }
  }

  // Auto-logout on expired/invalid token
  if (response.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errMsg = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      if (data && data.detail) {
        errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {}
    throw new Error(errMsg);
  }

  return response.json();
};

// ─── Auth API helpers ─────────────────────────────────────────────────────────
export const apiLogin = async (username, password) => {
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.access_token);
  setAuthUser({ username: data.username, is_admin: data.is_admin });
  return data;
};

export const apiRegister = async (username, email, password) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
};

export const apiUpload = async (endpoint, file) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "ngrok-skip-browser-warning": "69420",
    },
    body: formData,
  });

  if (response.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    let errMsg = `Upload failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
    } catch {}
    throw new Error(errMsg);
  }
  return response.json();
};
