import { clamp, readWindowMetrics } from '../dom.js';
import { isStackedViewport } from '../viewport.js';
import { saveWindowState } from '../windowState.js';
import { bringWindowForward } from './zIndex.js';
import { desktopWorkAreaPad, desktopWorkAreaTop, floatWindowAtCurrentRect } from './workArea.js';

const edgeNames = ['top', 'right', 'bottom', 'left', 'top-right', 'bottom-right', 'bottom-left', 'top-left'];

export function ensureResizeEdges(win) {
  if (win.dataset.windowResizable === 'false') {
    win.querySelectorAll(':scope > .wm-resize-edge').forEach((edge) => edge.remove());
    return;
  }
  edgeNames.forEach((edge) => {
    if (win.querySelector(`:scope > .wm-resize-edge--${edge}`)) return;
    const handle = document.createElement('span');
    handle.className = `wm-resize-edge wm-resize-edge--${edge}`;
    handle.dataset.resizeEdge = edge;
    handle.setAttribute('aria-hidden', 'true');
    win.appendChild(handle);
  });
}

export function attachResize(win, stage) {
  win.querySelectorAll(':scope > .wm-resize-edge').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (isStackedViewport()) return;
      if (!(event instanceof PointerEvent)) return;
      event.preventDefault();
      event.stopPropagation();
      bringWindowForward(win);

      const edge = handle.dataset.resizeEdge;
      const metrics = readWindowMetrics(win);
      const stageRect = stage.getBoundingClientRect();
      const winRect = win.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const startLeft = winRect.left - stageRect.left;
      const startTop = winRect.top - stageRect.top;
      const startWidth = winRect.width;
      const startHeight = winRect.height;

      floatWindowAtCurrentRect(win, stageRect, winRect);
      handle.setPointerCapture(event.pointerId);

      const move = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        let left = startLeft;
        let top = startTop;
        let width = startWidth;
        let height = startHeight;

        if (edge.includes('right')) width = startWidth + dx;
        if (edge.includes('bottom')) height = startHeight + dy;
        if (edge.includes('left')) {
          width = startWidth - dx;
          left = startLeft + dx;
        }
        if (edge.includes('top')) {
          height = startHeight - dy;
          top = startTop + dy;
        }

        width = clamp(width, metrics.minWidth, Math.min(metrics.maxWidth, stageRect.width - left));
        height = clamp(height, metrics.minHeight, Math.min(metrics.maxHeight, stageRect.height - top));
        if (edge.includes('left')) left = startLeft + (startWidth - width);
        if (edge.includes('top')) top = startTop + (startHeight - height);

        win.style.left = `${clamp(left, desktopWorkAreaPad, stageRect.width - metrics.minWidth - desktopWorkAreaPad)}px`;
        win.style.top = `${clamp(top, desktopWorkAreaTop, stageRect.height - metrics.minHeight)}px`;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
      };

      const stop = () => {
        handle.releasePointerCapture(event.pointerId);
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', stop);
        handle.removeEventListener('pointercancel', stop);
        saveWindowState();
      };

      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  });
}
