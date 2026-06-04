import { setWindowTitle } from '../dom.js';
import { isMobileViewport } from '../viewport.js';
import { applySavedWindowRect, getSavedWindowStates } from '../windowState.js';
import { initWindowManager } from '../windowManager.js';
import { openInternalHref } from './open.js';

export async function restoreWindowState() {
  if (isMobileViewport()) return;

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
    if (document.querySelector(`.desktop-stage .desktop-window[data-window-app="${state.app}"]`))
      continue;
    await openInternalHref(state.href, state.title, {
      updateHistory: false,
      updateRoute: false,
      restoreState: state,
    });
  }

  initWindowManager();
}
