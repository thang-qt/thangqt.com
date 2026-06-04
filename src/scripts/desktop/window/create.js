import { escapeHtml, getStage, getWindowDocument, setWindowTitle } from '../dom.js';
import { afterWindowContentChange } from '../contentEvents.js';
import { getAppKeyForHref, getWindowSpecForHref } from '../appRegistry.js';
import { setActiveRoute } from '../routing/history.js';
import { applySavedWindowRect, saveWindowState } from '../windowState.js';
import { initWindowManager } from '../windowManager.js';
import { bringWindowForward } from './zIndex.js';
import { defaultWindowRect } from './placement.js';
import { applyWindowSpec } from './spec.js';

export function getExistingWindowForHref(href) {
  const stage = getStage();
  if (!stage) return null;
  const appKey = getAppKeyForHref(href);
  const existing = stage.querySelector(`[data-window-app="${appKey}"]`);
  return existing instanceof HTMLElement ? existing : null;
}

export function createDesktopWindow({
  title,
  browserTitle,
  html,
  href,
  updateHistory = true,
  updateRoute = true,
  restoreState = null,
  replaceExisting = true,
} = {}) {
  const stage = getStage();
  if (!stage) return null;

  const appKey = getAppKeyForHref(href);
  const existing = replaceExisting ? stage.querySelector(`[data-window-app="${appKey}"]`) : null;
  if (existing instanceof HTMLElement) {
    setWindowTitle(existing, title.toUpperCase());
    const documentEl = getWindowDocument(existing);
    if (documentEl) documentEl.innerHTML = html;
    existing.dataset.windowUrl = href;
    existing.dataset.windowApp = appKey;
    applyWindowSpec(existing, href);
    existing.classList.remove('is-minimized');
    bringWindowForward(existing);
    if (restoreState) applySavedWindowRect(existing, restoreState);
    afterWindowContentChange();
    if (updateRoute) setActiveRoute(href, browserTitle || title, { replace: !updateHistory });
    saveWindowState();
    return existing;
  }

  const count = stage.querySelectorAll('.desktop-window').length;
  const { app, window: windowSpec } = getWindowSpecForHref(href);
  const rect = {
    ...defaultWindowRect(count, windowSpec),
    width: windowSpec.width,
    height: windowSpec.height,
  };
  const win = document.createElement('section');
  win.className = `desktop-window desktop-window--site desktop-window--app-${appKey.replace(/[^a-z0-9_-]/gi, '-')} wm-window is-floating`;
  win.dataset.windowUrl = href;
  win.dataset.windowApp = appKey;
  applyWindowSpec(win, href);
  Object.assign(win.style, rect);
  win.innerHTML = `
    <header class="desktop-window__bar">
      <h2>${escapeHtml(title.toUpperCase())}</h2>
      <div class="desktop-window__controls">
        <button type="button" data-window-action="minimize" aria-label="Minimize"></button>
        <button type="button" data-window-action="maximize" aria-label="Maximize"></button>
        <button type="button" data-window-action="close" aria-label="Close"></button>
      </div>
    </header>
    <div class="desktop-window__body">
      <div class="desktop-document">${html}</div>
    </div>
  `;
  stage.appendChild(win);
  initWindowManager();
  bringWindowForward(win);
  if (restoreState) applySavedWindowRect(win, restoreState);
  afterWindowContentChange();
  if (updateRoute) setActiveRoute(href, browserTitle || title, { replace: !updateHistory });
  saveWindowState();
  return win;
}
