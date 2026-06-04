import { fetchDesktopDocument } from '../pageLoader.js';
import { setActiveRoute } from './history.js';
import { saveWindowState } from '../windowState.js';
import { bringWindowForward } from '../window/zIndex.js';
import { applyWindowSpec } from '../window/spec.js';
import { createDesktopWindow, getExistingWindowForHref } from '../window/create.js';
import { beginWindowLoading, updateWindowContent } from '../window/content.js';
import { getAppKeyForHref } from '../appRegistry.js';
import { getWindowDocument, setWindowTitle } from '../dom.js';
import { afterWindowContentChange } from '../contentEvents.js';

export async function openInternalHref(href, title = 'Window', options = {}) {
  let loadingWindow = options.replaceExisting !== false ? getExistingWindowForHref(href) : null;
  if (!loadingWindow) {
    loadingWindow = createDesktopWindow({
      title,
      browserTitle: title,
      html: '',
      href,
      updateHistory: false,
      updateRoute: false,
      restoreState: options.restoreState || null,
      replaceExisting: options.replaceExisting !== false,
    });
  }
  const stopLoading = beginWindowLoading(loadingWindow);

  try {
    const { html, browserTitle, pageTitle } = await fetchDesktopDocument(href, title);
    return updateWindowContent(loadingWindow, {
      title: pageTitle,
      browserTitle,
      html,
      href,
      updateHistory: options.updateHistory !== false,
      updateRoute: options.updateRoute !== false,
      restoreState: options.restoreState || null,
    });
  } catch (error) {
    console.error(error);
    if (loadingWindow) {
      updateWindowContent(loadingWindow, {
        title,
        browserTitle: title,
        html: '<p>Could not load this page.</p>',
        href,
        updateHistory: false,
        updateRoute: false,
      });
    }
    if (options.fallbackToLocation === true) window.location.assign(href);
    return null;
  } finally {
    stopLoading();
  }
}

export async function openHrefInWindow(win, href, title = 'Window') {
  if (!(win instanceof HTMLElement)) return null;

  const stopLoading = beginWindowLoading(win);

  try {
    const { html, browserTitle, pageTitle } = await fetchDesktopDocument(href, title);
    const documentEl = getWindowDocument(win);

    setWindowTitle(win, pageTitle.toUpperCase());
    if (documentEl) documentEl.innerHTML = html;
    win.dataset.windowUrl = href;
    win.dataset.windowApp = getAppKeyForHref(href);
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
  } finally {
    stopLoading();
  }
}
