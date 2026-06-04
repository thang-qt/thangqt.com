import { marked } from 'marked';

marked.use({
  async: false,
  gfm: true,
  breaks: true,
});

function isSafeUrl(href = '') {
  try {
    const url = new URL(href, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return href.startsWith('/');
  }
}

function hardenLinks(container) {
  container.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!isSafeUrl(href)) {
      link.removeAttribute('href');
      return;
    }

    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
  });
}

function wrapTables(container) {
  container.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'llm-message__table-scroll';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

export function renderMarkdown(markdown = '') {
  const container = document.createElement('div');
  container.innerHTML = marked.parse(String(markdown));
  hardenLinks(container);
  wrapTables(container);
  return container.innerHTML;
}
