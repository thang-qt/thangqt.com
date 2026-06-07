export const storageKeys = {
  prefsMode: 'desktop-color-mode',
  prefsPack: 'desktop-theme-pack',
  prefsPattern: 'desktop-bg-pattern',
  prefsRestoreWindows: 'desktop-restore-windows',
  windowState: 'desktop-window-state',
  topZ: 'desktop-window-top-z',
};

export function safeRead(key, fallback = '') {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeWrite(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function safeReadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteJson(key, value) {
  safeWrite(key, JSON.stringify(value));
}

export function loadWindowStates() {
  const states = safeReadJson(storageKeys.windowState, []);
  return Array.isArray(states) ? states : [];
}

export function saveWindowStates(states, topZ = 100) {
  safeWriteJson(storageKeys.windowState, states);
  safeWrite(storageKeys.topZ, String(topZ));
}

export function loadTopZ() {
  return Number(safeRead(storageKeys.topZ, '100')) || 100;
}
