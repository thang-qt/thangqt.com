import { getDesktopWindows, getStage, getWindowTitle } from './dom.js';
import { loadTopZ, loadWindowStates, saveWindowStates } from './storage.js';

let saveTimer = 0;

export function getTopZ() {
  window.__wmTopZ ||= loadTopZ();
  return window.__wmTopZ;
}

export function setTopZ(value) {
  window.__wmTopZ = value;
}

export function bumpTopZ() {
  setTopZ(getTopZ() + 1);
  return getTopZ();
}

export function serializeWindowState() {
  const stageRect = getStage()?.getBoundingClientRect();

  return getDesktopWindows()
    .map((win) => {
      const rect = win.getBoundingClientRect();
      return {
        app: win.dataset.windowApp || '',
        href: win.dataset.windowUrl || '',
        title: getWindowTitle(win),
        zIndex: Number(win.style.zIndex || 0),
        minimized: win.classList.contains('is-minimized'),
        maximized: win.classList.contains('is-maximized'),
        floating: win.classList.contains('is-floating'),
        left: win.style.left || (stageRect ? `${rect.left - stageRect.left}px` : ''),
        top: win.style.top || (stageRect ? `${rect.top - stageRect.top}px` : ''),
        width: win.style.width || `${rect.width}px`,
        height: win.style.height || `${rect.height}px`,
        previousRect: win.dataset.previousRect || '',
        listView: win.dataset.listView || '',
      };
    })
    .filter((item) => item.app && item.href);
}

export function saveWindowState() {
  saveWindowStates(serializeWindowState(), getTopZ());
}

export function scheduleWindowStateSave() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveWindowState, 80);
}

export function getSavedWindowStates() {
  setTopZ(loadTopZ());
  return loadWindowStates();
}

export function applySavedWindowRect(win, state) {
  if (!(win instanceof HTMLElement) || !state) return;
  win.classList.toggle('is-floating', state.floating || Boolean(state.left || state.top));
  win.classList.toggle('is-minimized', Boolean(state.minimized));
  win.classList.toggle('is-maximized', Boolean(state.maximized));
  if (state.left) win.style.left = state.left;
  if (state.top) win.style.top = state.top;
  if (state.width) win.style.width = state.width;
  if (state.height) win.style.height = state.height;
  if (state.zIndex) win.style.zIndex = String(state.zIndex);
  if (state.previousRect) win.dataset.previousRect = state.previousRect;
  if (state.listView) {
    win.dataset.listView = state.listView;
    win.querySelectorAll('[data-list-view]').forEach((item) => {
      item.toggleAttribute('aria-pressed', item.dataset.listView === state.listView);
    });
  }
}
