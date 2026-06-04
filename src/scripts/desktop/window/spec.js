import { getWindowSpecForHref } from '../appRegistry.js';

export function shouldBleedWindow(href) {
  const pathname = new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
  return pathname === '/projects' || /^\/projects\/page\/\d+$/.test(pathname);
}

export function applyWindowSpec(win, href) {
  const { app, window: windowSpec } = getWindowSpecForHref(href);
  win.dataset.windowBaseApp = app.id;
  if (shouldBleedWindow(href)) {
    win.dataset.windowBleed = 'true';
    win.dataset.windowFlags = 'bleed';
  } else {
    delete win.dataset.windowBleed;
    delete win.dataset.windowFlags;
  }
  win.dataset.windowMinWidth = String(windowSpec.minWidth);
  win.dataset.windowMinHeight = String(windowSpec.minHeight);
  if (windowSpec.maxWidth) win.dataset.windowMaxWidth = String(windowSpec.maxWidth);
  else delete win.dataset.windowMaxWidth;
  if (windowSpec.maxHeight) win.dataset.windowMaxHeight = String(windowSpec.maxHeight);
  else delete win.dataset.windowMaxHeight;
  win.dataset.windowResizable = windowSpec.resizable === false ? 'false' : 'true';
  win.dataset.windowMaximizable = windowSpec.maximizable === false ? 'false' : 'true';
  return { app, windowSpec };
}
