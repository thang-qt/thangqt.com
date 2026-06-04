import { safeRead, safeWrite, storageKeys } from './storage.js';

const defaultPrefs = {
  mode: 'light',
  pack: 'bloom',
  pattern: 'dots',
};

const legacyPatternMap = { tiles: 'grid', rings: 'dots' };

function normalizePattern(pattern) {
  return legacyPatternMap[pattern] || pattern || defaultPrefs.pattern;
}

function normalizePack(pack) {
  return pack === 'oxide' ? 'bloom' : pack || defaultPrefs.pack;
}

function normalizeMode(mode) {
  return ['auto', 'light', 'dark'].includes(mode) ? mode : defaultPrefs.mode;
}

function resolveColorMode(mode) {
  if (mode !== 'auto') return mode;
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

export function getDesktopPrefs() {
  const pack = normalizePack(safeRead(storageKeys.prefsPack, defaultPrefs.pack));
  if (pack === 'bloom' && safeRead(storageKeys.prefsPack) === 'oxide') {
    safeWrite(storageKeys.prefsPack, 'bloom');
  }

  return {
    mode: normalizeMode(safeRead(storageKeys.prefsMode, defaultPrefs.mode)),
    pack,
    pattern: normalizePattern(safeRead(storageKeys.prefsPattern, defaultPrefs.pattern)),
  };
}

export function applyDesktopPrefs(nextPrefs = {}) {
  const current = getDesktopPrefs();
  const prefs = {
    mode: normalizeMode(nextPrefs.mode || current.mode),
    pack: normalizePack(nextPrefs.pack || current.pack),
    pattern: normalizePattern(nextPrefs.pattern || current.pattern),
  };

  document.documentElement.dataset.colorMode = resolveColorMode(prefs.mode);
  document.documentElement.dataset.colorModePref = prefs.mode;
  document.documentElement.dataset.themePack = prefs.pack;
  document.documentElement.dataset.bgPattern = prefs.pattern;
  safeWrite(storageKeys.prefsMode, prefs.mode);
  safeWrite(storageKeys.prefsPack, prefs.pack);
  safeWrite(storageKeys.prefsPattern, prefs.pattern);

  window.dispatchEvent(new CustomEvent('desktop:prefs-change', { detail: { ...prefs, resolvedMode: resolveColorMode(prefs.mode) } }));
  return prefs;
}

export function syncSettingsControls() {
  const { mode, pack, pattern } = getDesktopPrefs();
  document.querySelectorAll('[data-settings-mode]').forEach((input) => {
    input.checked = input.value === mode;
  });
  document.querySelectorAll('[data-settings-pack]').forEach((input) => {
    input.checked = input.value === pack;
  });
  document.querySelectorAll('[data-settings-pattern]').forEach((input) => {
    input.checked = input.value === pattern;
  });
}

export function initSettingsControls() {
  if (window.__desktopSettingsReady) return;
  window.__desktopSettingsReady = true;

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target?.matches?.('[data-settings-mode]')) applyDesktopPrefs({ mode: target.value });
    if (target?.matches?.('[data-settings-pack]')) applyDesktopPrefs({ pack: target.value });
    if (target?.matches?.('[data-settings-pattern]')) applyDesktopPrefs({ pattern: target.value });
  });

  window.addEventListener('desktop:prefs-change', syncSettingsControls);
}
