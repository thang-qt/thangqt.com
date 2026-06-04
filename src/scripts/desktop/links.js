import { addGlobalListenerOnce } from './events.js';
import { openInternalHref } from './router.js';

export function getInternalHref(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target || anchor.hasAttribute('download')) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname.startsWith('/rss.xml') || url.pathname.endsWith('.pdf')) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getLinkTitle(anchor) {
  return anchor?.dataset?.windowTitle || anchor?.textContent?.trim() || 'Window';
}

export function openLink(anchor, mode = 'auto') {
  const href = getInternalHref(anchor);
  if (!href) {
    if (anchor?.href) window.open(anchor.href, '_blank', 'noopener,noreferrer');
    return;
  }

  const title = getLinkTitle(anchor);
  openInternalHref(href, title, {
    replaceExisting: mode !== 'new-window',
  });
}

export function initWindowLinks() {
  addGlobalListenerOnce('desktop-links:click', document, 'click', (event) => {
    const link = event.target?.closest?.('a');
    if (!(link instanceof HTMLAnchorElement)) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!getInternalHref(link)) return;

    event.preventDefault();
    openLink(link, link.dataset.windowTarget === 'new' ? 'new-window' : 'auto');
  });

  addGlobalListenerOnce('desktop-links:popstate', window, 'popstate', (event) => {
    const href = event.state?.href || `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const title = event.state?.title || 'Window';
    openInternalHref(href, title, { updateHistory: false });
  });
}
