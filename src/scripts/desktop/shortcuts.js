import { addGlobalListenerOnce, isTypingTarget } from './events.js';
import { clamp, getDesktopWindows, getWindowDocument, readWindowMetrics } from './dom.js';
import { isStackedViewport } from './viewport.js';
import { bringWindowForward } from './windowManager.js';
import { saveWindowState } from './windowState.js';

const selectableQuery = [
  '.ledger-row__link',
  '.bookmark-card__main',
  '.project-color-section__link',
  '.list-link',
].join(', ');

function getHelper() {
  return document.querySelector('[data-shortcuts-helper]');
}

function getActiveWindow() {
  const windows = getDesktopWindows().filter((win) => !win.classList.contains('is-minimized'));
  if (windows.length === 0) return null;

  return windows.reduce((active, win) => {
    const activeZ = Number.parseInt(active.style.zIndex || '0', 10) || 0;
    const winZ = Number.parseInt(win.style.zIndex || '0', 10) || 0;
    return winZ >= activeZ ? win : active;
  }, windows[0]);
}

function getActiveScroller(win) {
  return win?.querySelector('.desktop-window__body') || win;
}

function getSelectableItems(win) {
  const documentEl = getWindowDocument(win);
  if (!documentEl) return [];
  return [...documentEl.querySelectorAll(selectableQuery)].filter((item) => item instanceof HTMLElement);
}

function getSelectedIndex(items) {
  return items.findIndex((item) => item.classList.contains('is-key-selected'));
}

function selectItem(win, direction) {
  const items = getSelectableItems(win);
  if (items.length === 0) return false;

  const previous = getSelectedIndex(items);
  const next = previous < 0
    ? (direction > 0 ? 0 : items.length - 1)
    : clamp(previous + direction, 0, items.length - 1);

  items.forEach((item, index) => {
    item.classList.toggle('is-key-selected', index === next);
    item.setAttribute('aria-selected', index === next ? 'true' : 'false');
  });

  items[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return true;
}

function openSelectedItem(win) {
  const items = getSelectableItems(win);
  const selected = items[getSelectedIndex(items)];
  if (!selected) return false;
  selected.click();
  return true;
}

function scrollActiveWindow(win, key) {
  const scroller = getActiveScroller(win);
  if (!scroller) return false;

  const amount = key === 'j' || key === 'k' ? Math.round(scroller.clientHeight * 0.18) : Math.round(scroller.clientWidth * 0.18);
  const top = key === 'j' ? amount : key === 'k' ? -amount : 0;
  const left = key === 'l' ? amount : key === 'h' ? -amount : 0;
  scroller.scrollBy({ top, left, behavior: 'smooth' });
  return true;
}

function focusWindow(key) {
  const windows = getDesktopWindows().filter((win) => !win.classList.contains('is-minimized'));
  if (windows.length <= 1) return false;

  const active = getActiveWindow();
  if (!active) return false;

  if (isStackedViewport()) {
    const current = windows.indexOf(active);
    const direction = key === 'j' || key === 'l' ? 1 : -1;
    const next = windows[(current + direction + windows.length) % windows.length];
    bringWindowForward(next);
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  const activeRect = active.getBoundingClientRect();
  const activeCenter = {
    x: activeRect.left + activeRect.width / 2,
    y: activeRect.top + activeRect.height / 2,
  };

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  windows.forEach((win) => {
    if (win === active) return;
    const rect = win.getBoundingClientRect();
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const dx = center.x - activeCenter.x;
    const dy = center.y - activeCenter.y;

    const isCandidate =
      (key === 'h' && dx < 0) ||
      (key === 'l' && dx > 0) ||
      (key === 'k' && dy < 0) ||
      (key === 'j' && dy > 0);
    if (!isCandidate) return;

    const primary = key === 'h' || key === 'l' ? Math.abs(dx) : Math.abs(dy);
    const secondary = key === 'h' || key === 'l' ? Math.abs(dy) : Math.abs(dx);
    const score = primary * 2 + secondary;
    if (score < bestScore) {
      bestScore = score;
      best = win;
    }
  });

  if (!best) return false;
  bringWindowForward(best);
  return true;
}

function closeActiveWindow() {
  const activeWin = getActiveWindow();
  if (!activeWin) return false;
  activeWin.remove();
  saveWindowState();
  return true;
}

function minimizeActiveWindow() {
  const activeWin = getActiveWindow();
  if (!activeWin) return false;
  activeWin.classList.toggle('is-minimized');
  saveWindowState();
  return true;
}

function toggleMaximizeActiveWindow() {
  const activeWin = getActiveWindow();
  if (!activeWin || activeWin.dataset.windowMaximizable === 'false' || isStackedViewport()) return false;

  activeWin.classList.remove('is-minimized');
  if (activeWin.classList.contains('is-maximized')) {
    activeWin.classList.remove('is-maximized');
    const previous = activeWin.dataset.previousRect;
    if (previous) {
      const rect = JSON.parse(previous);
      activeWin.style.left = rect.left;
      activeWin.style.top = rect.top;
      activeWin.style.width = rect.width;
      activeWin.style.height = rect.height;
    }
    saveWindowState();
    return true;
  }

  activeWin.dataset.previousRect = JSON.stringify({
    left: activeWin.style.left,
    top: activeWin.style.top,
    width: activeWin.style.width,
    height: activeWin.style.height,
  });
  activeWin.classList.add('is-floating', 'is-maximized');
  activeWin.style.left = '12px';
  activeWin.style.top = '64px';
  activeWin.style.width = 'calc(100vw - 24px)';
  activeWin.style.height = 'calc(100dvh - 76px)';
  bringWindowForward(activeWin);
  saveWindowState();
  return true;
}

function canMoveFloatingWindow(win) {
  return win && win.classList.contains('is-floating') && !isStackedViewport();
}

function moveWindow(win, key) {
  if (!canMoveFloatingWindow(win)) return false;
  const step = 24;
  const left = Number.parseFloat(win.style.left || '0') || 0;
  const top = Number.parseFloat(win.style.top || '0') || 0;
  if (key === 'h') win.style.left = `${left - step}px`;
  if (key === 'l') win.style.left = `${left + step}px`;
  if (key === 'k') win.style.top = `${top - step}px`;
  if (key === 'j') win.style.top = `${top + step}px`;
  bringWindowForward(win);
  return true;
}

function resizeWindow(win, key) {
  if (!canMoveFloatingWindow(win) || win.dataset.windowResizable === 'false') return false;
  const metrics = readWindowMetrics(win);
  const step = 32;
  const width = Number.parseFloat(win.style.width || String(win.getBoundingClientRect().width)) || win.getBoundingClientRect().width;
  const height = Number.parseFloat(win.style.height || String(win.getBoundingClientRect().height)) || win.getBoundingClientRect().height;

  if (key === 'h') win.style.width = `${clamp(width - step, metrics.minWidth, metrics.maxWidth)}px`;
  if (key === 'l') win.style.width = `${clamp(width + step, metrics.minWidth, metrics.maxWidth)}px`;
  if (key === 'k') win.style.height = `${clamp(height - step, metrics.minHeight, metrics.maxHeight)}px`;
  if (key === 'j') win.style.height = `${clamp(height + step, metrics.minHeight, metrics.maxHeight)}px`;
  bringWindowForward(win);
  return true;
}

export function openShortcutsHelper() {
  const helper = getHelper();
  if (!helper) return;
  helper.hidden = false;
}

export function closeShortcutsHelper() {
  const helper = getHelper();
  if (!helper) return;
  helper.hidden = true;
}

function toggleShortcutsHelper() {
  const helper = getHelper();
  if (!helper) return;
  if (helper.hidden) openShortcutsHelper();
  else closeShortcutsHelper();
}

export function initShortcutHelper() {
  addGlobalListenerOnce('desktop-shortcuts:click', document, 'click', (event) => {
    if (event.target?.closest?.('[data-shortcuts-close]')) {
      closeShortcutsHelper();
    }
  });

  addGlobalListenerOnce('desktop-shortcuts:keydown', document, 'keydown', (event) => {
    if (isTypingTarget(event.target)) return;

    if (event.key === '?') {
      event.preventDefault();
      toggleShortcutsHelper();
      return;
    }

    if (event.key === 'Escape' && !getHelper()?.hidden) {
      event.preventDefault();
      closeShortcutsHelper();
      return;
    }

    const key = event.key.toLowerCase();
    if (!['h', 'j', 'k', 'l', 'q', 'm', 'f', 'enter'].includes(key)) return;

    const activeWin = getActiveWindow();
    if (!activeWin) return;

    if (event.altKey && key === 'q') {
      if (closeActiveWindow()) event.preventDefault();
      return;
    }

    if (event.altKey && key === 'm') {
      if (minimizeActiveWindow()) event.preventDefault();
      return;
    }

    if (event.altKey && key === 'f') {
      if (toggleMaximizeActiveWindow()) event.preventDefault();
      return;
    }

    if (event.altKey && event.ctrlKey && ['h', 'j', 'k', 'l'].includes(key)) {
      if (resizeWindow(activeWin, key)) event.preventDefault();
      return;
    }

    if (event.altKey && event.shiftKey && ['h', 'j', 'k', 'l'].includes(key)) {
      if (moveWindow(activeWin, key)) event.preventDefault();
      return;
    }

    if (event.altKey && ['h', 'j', 'k', 'l'].includes(key)) {
      if (focusWindow(key)) event.preventDefault();
      return;
    }

    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (key === 'enter') {
      if (openSelectedItem(activeWin)) event.preventDefault();
      return;
    }

    if (key === 'j' || key === 'k') {
      if (selectItem(activeWin, key === 'j' ? 1 : -1)) event.preventDefault();
      else if (scrollActiveWindow(activeWin, key)) event.preventDefault();
      return;
    }

    if (key === 'h' || key === 'l') {
      if (scrollActiveWindow(activeWin, key)) event.preventDefault();
    }
  });
}
