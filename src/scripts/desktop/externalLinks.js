const EXTERNAL_LINK_REL = ['noopener'];

function isExternalHttpLink(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) return false;

  try {
    const url = new URL(anchor.href, window.location.href);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function mergeRel(existingRel = '') {
  const values = new Set(existingRel.split(/\s+/).filter(Boolean));
  for (const rel of EXTERNAL_LINK_REL) values.add(rel);
  return [...values].join(' ');
}

export function initExternalLinks(root = document) {
  root.querySelectorAll?.('a[href]').forEach((anchor) => {
    if (!isExternalHttpLink(anchor)) return;

    anchor.target = '_blank';
    anchor.rel = mergeRel(anchor.rel);
  });
}
