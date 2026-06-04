import { getWindowDocument, setWindowTitle } from '../dom.js';
import { afterWindowContentChange } from '../contentEvents.js';
import { getAppKeyForHref } from '../appRegistry.js';
import { setActiveRoute } from '../routing/history.js';
import { applySavedWindowRect, saveWindowState } from '../windowState.js';
import { bringWindowForward } from './zIndex.js';
import { applyWindowSpec } from './spec.js';

export function updateWindowContent(win, { title, browserTitle, html, href, updateHistory = true, updateRoute = true, restoreState = null } = {}) {
  if (!(win instanceof HTMLElement)) return null;

  setWindowTitle(win, title.toUpperCase());
  const documentEl = getWindowDocument(win);
  if (documentEl) documentEl.innerHTML = html;
  win.dataset.windowUrl = href;
  win.dataset.windowApp = getAppKeyForHref(href);
  applyWindowSpec(win, href);
  win.classList.remove('is-minimized');
  bringWindowForward(win);
  if (restoreState) applySavedWindowRect(win, restoreState);
  afterWindowContentChange();
  if (updateRoute) setActiveRoute(href, browserTitle || title, { replace: !updateHistory });
  saveWindowState();
  return win;
}

export function beginWindowLoading(win, delay = 140) {
  if (!(win instanceof HTMLElement)) return () => {};

  const timer = window.setTimeout(() => {
    win.classList.add('is-loading');
  }, delay);

  return () => {
    window.clearTimeout(timer);
    win.classList.remove('is-loading');
  };
}
