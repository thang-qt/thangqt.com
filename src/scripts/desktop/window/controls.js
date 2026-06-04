import { isStackedViewport } from '../viewport.js';
import { saveWindowState } from '../windowState.js';
import { bringWindowForward } from './zIndex.js';
import { desktopWorkAreaPad, desktopWorkAreaTop } from './workArea.js';

export function toggleMaximize(win) {
  if (win.dataset.windowMaximizable === 'false' || isStackedViewport()) return;
  win.classList.remove('is-minimized');
  if (win.classList.contains('is-maximized')) {
    win.classList.remove('is-maximized');
    const previous = win.dataset.previousRect;
    if (previous) {
      const rect = JSON.parse(previous);
      win.style.left = rect.left;
      win.style.top = rect.top;
      win.style.width = rect.width;
      win.style.height = rect.height;
    }
    saveWindowState();
    return;
  }

  win.dataset.previousRect = JSON.stringify({
    left: win.style.left,
    top: win.style.top,
    width: win.style.width,
    height: win.style.height,
  });
  win.classList.add('is-floating', 'is-maximized');
  win.style.left = `${desktopWorkAreaPad}px`;
  win.style.top = `${desktopWorkAreaTop}px`;
  win.style.width = 'calc(100vw - 24px)';
  win.style.height = `calc(100dvh - ${desktopWorkAreaTop + desktopWorkAreaPad}px)`;
  bringWindowForward(win);
  saveWindowState();
}

export function attachControls(win) {
  win.querySelector('[data-window-action="close"]')?.addEventListener('click', () => {
    win.remove();
    saveWindowState();
  });

  win.querySelector('[data-window-action="minimize"]')?.addEventListener('click', () => {
    win.classList.toggle('is-minimized');
    saveWindowState();
  });

  const maximizeButton = win.querySelector('[data-window-action="maximize"]');
  if (win.dataset.windowMaximizable === 'false') {
    maximizeButton?.setAttribute('hidden', '');
    maximizeButton?.setAttribute('aria-hidden', 'true');
  }

  maximizeButton?.addEventListener('click', () => toggleMaximize(win));
}
