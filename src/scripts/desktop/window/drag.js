import { clamp } from '../dom.js';
import { isStackedViewport } from '../viewport.js';
import { saveWindowState } from '../windowState.js';
import { bringWindowForward } from './zIndex.js';
import { desktopWorkAreaPad, desktopWorkAreaTop, floatWindowAtCurrentRect } from './workArea.js';

function canDragFrom(event, dragHandle) {
  if (event.target.closest('a, button, input, textarea, select, summary, .wm-resize-edge')) return false;
  return Boolean(dragHandle?.contains(event.target));
}

export function attachDrag(win, stage) {
  const dragHandle = win.querySelector('.desktop-window__bar');
  win.addEventListener('pointerdown', (event) => {
    if (isStackedViewport()) return;
    if (!(event instanceof PointerEvent) || !canDragFrom(event, dragHandle)) return;
    event.preventDefault();
    bringWindowForward(win);

    const stageRect = stage.getBoundingClientRect();
    const winRect = win.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = winRect.left - stageRect.left;
    const startTop = winRect.top - stageRect.top;

    floatWindowAtCurrentRect(win, stageRect, winRect);
    win.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      const nextLeft = clamp(startLeft + moveEvent.clientX - startX, desktopWorkAreaPad, stageRect.width - winRect.width - desktopWorkAreaPad);
      const nextTop = clamp(startTop + moveEvent.clientY - startY, desktopWorkAreaTop, stageRect.height - 40);
      win.style.left = `${nextLeft}px`;
      win.style.top = `${nextTop}px`;
    };

    const stop = () => {
      win.releasePointerCapture(event.pointerId);
      win.removeEventListener('pointermove', move);
      win.removeEventListener('pointerup', stop);
      win.removeEventListener('pointercancel', stop);
      saveWindowState();
    };

    win.addEventListener('pointermove', move);
    win.addEventListener('pointerup', stop);
    win.addEventListener('pointercancel', stop);
  });
}
