import { safeRead, safeWrite, storageKeys } from './storage.js';

const defaultPrefs = {
  mode: 'light',
  pack: 'poolsuite',
  pattern: 'tiles',
};

function normalizePack(pack) {
  return pack === 'oxide' ? 'bloom' : pack || defaultPrefs.pack;
}

export function getDesktopPrefs() {
  const pack = normalizePack(safeRead(storageKeys.prefsPack, defaultPrefs.pack));
  if (pack === 'bloom' && safeRead(storageKeys.prefsPack) === 'oxide') {
    safeWrite(storageKeys.prefsPack, 'bloom');
  }

  return {
    mode: safeRead(storageKeys.prefsMode, defaultPrefs.mode),
    pack,
    pattern: safeRead(storageKeys.prefsPattern, defaultPrefs.pattern),
  };
}

export function applyDesktopPrefs(nextPrefs = {}) {
  const current = getDesktopPrefs();
  const prefs = {
    mode: nextPrefs.mode || current.mode,
    pack: normalizePack(nextPrefs.pack || current.pack),
    pattern: nextPrefs.pattern || current.pattern,
  };

  document.documentElement.dataset.colorMode = prefs.mode;
  document.documentElement.dataset.themePack = prefs.pack;
  document.documentElement.dataset.bgPattern = prefs.pattern;
  safeWrite(storageKeys.prefsMode, prefs.mode);
  safeWrite(storageKeys.prefsPack, prefs.pack);
  safeWrite(storageKeys.prefsPattern, prefs.pattern);

  window.dispatchEvent(new CustomEvent('desktop:prefs-change', { detail: prefs }));
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
