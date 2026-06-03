export function getStage() {
  return document.querySelector('.desktop-stage');
}

export function getDesktopWindows() {
  return Array.from(document.querySelectorAll('.desktop-stage .desktop-window')).filter(
    (win) => win instanceof HTMLElement,
  );
}

export function getWindowTitle(win) {
  return win.querySelector('.desktop-window__bar h2')?.textContent || 'WINDOW';
}

export function setWindowTitle(win, title) {
  const titleEl = win.querySelector('.desktop-window__bar h2');
  if (titleEl) titleEl.textContent = title;
}

export function getWindowDocument(win) {
  return win.querySelector('.desktop-document');
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function toNumber(value, fallback) {
  const next = Number.parseFloat(value);
  return Number.isFinite(next) ? next : fallback;
}

export function readWindowMetrics(win) {
  return {
    minWidth: toNumber(win.dataset.windowMinWidth, 260),
    minHeight: toNumber(win.dataset.windowMinHeight, 180),
    maxWidth: toNumber(win.dataset.windowMaxWidth, Number.POSITIVE_INFINITY),
    maxHeight: toNumber(win.dataset.windowMaxHeight, Number.POSITIVE_INFINITY),
    resizable: win.dataset.windowResizable !== 'false',
  };
}

export function applyWindowTokens(win) {
  const raw = win.dataset.windowTokens;
  if (!raw) return;

  try {
    const tokens = JSON.parse(raw);
    const mode = document.documentElement.dataset.colorMode || 'light';
    const next = tokens[mode];
    if (!next || typeof next !== 'object') return;
    Object.entries(next).forEach(([key, value]) => {
      win.style.setProperty(`--${key}`, String(value));
    });
  } catch {}
}
