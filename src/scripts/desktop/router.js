import { escapeHtml, getStage, getWindowDocument, setWindowTitle } from './dom.js';
import { getAppKeyForHref, getWindowSpecForHref } from './appRegistry.js';
import { syncSettingsControls } from './prefs.js';
import { applySavedWindowRect, getSavedWindowStates, saveWindowState } from './windowState.js';
import { bringWindowForward, initWindowManager } from './windowManager.js';

export function appKeyFromHref(href) {
  return getAppKeyForHref(href);
}

export function setActiveRoute(href, title, { replace = false } = {}) {
  const nextUrl = new URL(href, window.location.origin);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

  if (replace) window.history.replaceState({ href: nextPath, title }, '', nextPath);
  else if (nextPath !== currentUrl) window.history.pushState({ href: nextPath, title }, '', nextPath);

  if (title) document.title = title.includes('ThangQT') ? title : `${title} - ThangQT`;

  document.querySelectorAll('.desktop-menu__nav a').forEach((navLink) => {
    const navPath = new URL(navLink.href).pathname;
    const isActive = navPath === '/'
      ? nextUrl.pathname === '/'
      : nextUrl.pathname === navPath || nextUrl.pathname.startsWith(`${navPath}/`);
    if (isActive) navLink.setAttribute('aria-current', 'page');
    else navLink.removeAttribute('aria-current');
  });
}

function defaultWindowRect(count) {
  return {
    left: `${36 + count * 28}px`,
    top: `${64 + count * 24}px`,
  };
}

function applyWindowSpec(win, href) {
  const { app, window: windowSpec } = getWindowSpecForHref(href);
  win.dataset.windowBaseApp = app.id;
  win.dataset.windowMinWidth = String(windowSpec.minWidth);
  win.dataset.windowMinHeight = String(windowSpec.minHeight);
  if (windowSpec.maxWidth) win.dataset.windowMaxWidth = String(windowSpec.maxWidth);
  else delete win.dataset.windowMaxWidth;
  if (windowSpec.maxHeight) win.dataset.windowMaxHeight = String(windowSpec.maxHeight);
  else delete win.dataset.windowMaxHeight;
  win.dataset.windowResizable = windowSpec.resizable === false ? 'false' : 'true';
  return { app, windowSpec };
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

  const appKey = appKeyFromHref(href);
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
    ...defaultWindowRect(count),
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

export async function openInternalHref(href, title = 'Window', options = {}) {
  try {
    const response = await fetch(href);
    if (!response.ok) throw new Error(`Failed to load ${href}: ${response.status}`);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const content = doc.querySelector('.desktop-document')?.innerHTML;
    const documentTitle = doc.querySelector('.desktop-document [data-window-title]')?.getAttribute('data-window-title');
    const browserTitle = doc.querySelector('title')?.textContent || documentTitle || title;
    const pageTitle = documentTitle || browserTitle.replace(/\s+-\s+ThangQT.*$/, '') || title;
    return createDesktopWindow({
      title: pageTitle,
      browserTitle,
      html: content || '<p>Could not load this page.</p>',
      href,
      updateHistory: options.updateHistory !== false,
      updateRoute: options.updateRoute !== false,
      restoreState: options.restoreState || null,
      replaceExisting: options.replaceExisting !== false,
    });
  } catch (error) {
    console.error(error);
    if (options.fallbackToLocation === true) window.location.assign(href);
    return null;
  }
}

export async function openHrefInWindow(win, href, title = 'Window') {
  if (!(win instanceof HTMLElement)) return null;

  try {
    const response = await fetch(href);
    if (!response.ok) throw new Error(`Failed to load ${href}: ${response.status}`);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const content = doc.querySelector('.desktop-document')?.innerHTML;
    const documentTitle = doc.querySelector('.desktop-document [data-window-title]')?.getAttribute('data-window-title');
    const browserTitle = doc.querySelector('title')?.textContent || documentTitle || title;
    const pageTitle = documentTitle || browserTitle.replace(/\s+-\s+ThangQT.*$/, '') || title;
    const documentEl = getWindowDocument(win);

    setWindowTitle(win, pageTitle.toUpperCase());
    if (documentEl) documentEl.innerHTML = content || '<p>Could not load this page.</p>';
    win.dataset.windowUrl = href;
    win.dataset.windowApp = appKeyFromHref(href);
    applyWindowSpec(win, href);
    win.classList.remove('is-minimized');
    bringWindowForward(win);
    afterWindowContentChange();
    setActiveRoute(href, browserTitle || pageTitle);
    saveWindowState();
    return win;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function restoreWindowState() {
  const states = getSavedWindowStates();
  if (states.length === 0) return;

  const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const currentWindow = document.querySelector('.desktop-stage .desktop-window[data-window-url]');
  const currentState = states.find((state) => state.href === currentHref);
  if (currentWindow instanceof HTMLElement && currentState) {
    currentWindow.dataset.windowApp = currentState.app;
    currentWindow.dataset.windowUrl = currentState.href;
    setWindowTitle(currentWindow, currentState.title);
    applySavedWindowRect(currentWindow, currentState);
  }

  for (const state of states) {
    if (!state.href || state.href === currentHref) continue;
    if (document.querySelector(`.desktop-stage .desktop-window[data-window-app="${state.app}"]`)) continue;
    await openInternalHref(state.href, state.title, {
      updateHistory: false,
      updateRoute: false,
      restoreState: state,
    });
  }

  initWindowManager();
}

export function afterWindowContentChange() {
  syncSettingsControls();
  window.dispatchEvent(new CustomEvent('desktop:content-change'));
}
