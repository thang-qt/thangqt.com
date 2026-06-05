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

const allowedTags = new Set([
  'A',
  'BLOCKQUOTE',
  'BR',
  'CODE',
  'DEL',
  'EM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'LI',
  'OL',
  'P',
  'PRE',
  'STRONG',
  'TABLE',
  'TBODY',
  'TD',
  'TH',
  'THEAD',
  'TR',
  'UL',
]);

const blockedTags = new Set(['IFRAME', 'MATH', 'OBJECT', 'SCRIPT', 'STYLE', 'SVG']);
const allowedAttributes = new Map([
  ['A', new Set(['href', 'title'])],
  ['TD', new Set(['align', 'colspan', 'rowspan'])],
  ['TH', new Set(['align', 'colspan', 'rowspan'])],
]);

function stripDisallowedElement(element) {
  if (blockedTags.has(element.tagName)) {
    element.remove();
    return;
  }

  while (element.firstChild) element.parentNode?.insertBefore(element.firstChild, element);
  element.remove();
}

function sanitizeMarkdownHtml(container) {
  container.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      stripDisallowedElement(element);
      return;
    }

    const allowedForTag = allowedAttributes.get(element.tagName) || new Set();
    Array.from(element.attributes).forEach((attribute) => {
      if (!allowedForTag.has(attribute.name.toLowerCase())) element.removeAttribute(attribute.name);
    });
  });
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
  sanitizeMarkdownHtml(container);
  hardenLinks(container);
  wrapTables(container);
  return container.innerHTML;
}
