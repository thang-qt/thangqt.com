import { getDesktopWindows, readWindowMetrics } from '../dom.js';
import { addGlobalListenerOnce } from '../events.js';
import { isStackedViewport } from '../viewport.js';
import { scheduleWindowStateSave } from '../windowState.js';
import { desktopWorkAreaPad, desktopWorkAreaTop, numericStyle } from './workArea.js';

let resizeRafId = 0;

export function initViewportResizeNudge(stage) {
  addGlobalListenerOnce('desktop-window-manager:resize-nudge', window, 'resize', () => {
    cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => nudgeAllWindowsIntoView(stage));
  });
}

function nudgeAllWindowsIntoView(stage) {
  if (isStackedViewport()) return;

  const stageRect = stage.getBoundingClientRect();
  const maxRight = stageRect.width - desktopWorkAreaPad;
  const maxBottom = stageRect.height - desktopWorkAreaPad;

  getDesktopWindows().forEach((win) => {
    if (!win.classList.contains('is-floating')) return;
    if (win.classList.contains('is-maximized')) return;

    const metrics = readWindowMetrics(win);
    const winRect = win.getBoundingClientRect();
    let left = numericStyle(win.style.left, winRect.left - stageRect.left);
    let top = numericStyle(win.style.top, winRect.top - stageRect.top);
    let width = numericStyle(win.style.width, winRect.width);
    let height = numericStyle(win.style.height, winRect.height);

    const maxW = Math.max(metrics.minWidth, stageRect.width - desktopWorkAreaPad * 2);
    const maxH = Math.max(
      metrics.minHeight,
      stageRect.height - desktopWorkAreaTop - desktopWorkAreaPad,
    );
    if (width > maxW) {
      width = maxW;
      win.style.width = `${width}px`;
    }
    if (height > maxH) {
      height = maxH;
      win.style.height = `${height}px`;
    }

    const rightEdge = left + width;
    if (rightEdge > maxRight) left = Math.max(desktopWorkAreaPad, maxRight - width);
    const bottomEdge = top + height;
    if (bottomEdge > maxBottom) top = Math.max(desktopWorkAreaTop, maxBottom - height);

    left = Math.max(desktopWorkAreaPad, left);
    top = Math.max(desktopWorkAreaTop, top);

    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  });

  scheduleWindowStateSave();
}
