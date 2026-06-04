export async function fetchDesktopDocument(href, fallbackTitle = 'Window') {
  const response = await fetch(href);
  if (!response.ok) throw new Error(`Failed to load ${href}: ${response.status}`);

  const text = await response.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const html =
    doc.querySelector('.desktop-document')?.innerHTML || '<p>Could not load this page.</p>';
  const documentTitle = doc
    .querySelector('.desktop-document [data-window-title]')
    ?.getAttribute('data-window-title');
  const browserTitle = doc.querySelector('title')?.textContent || documentTitle || fallbackTitle;
  const pageTitle = documentTitle || browserTitle.replace(/\s+-\s+ThangQT.*$/, '') || fallbackTitle;

  return { html, documentTitle, browserTitle, pageTitle };
}
