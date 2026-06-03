import {
  applyWindowTokens,
  clamp,
  getDesktopWindows,
  getStage,
  readWindowMetrics,
} from './dom.js';
import { bumpTopZ, saveWindowState, scheduleWindowStateSave } from './windowState.js';

const edgeNames = ['top', 'right', 'bottom', 'left'];

export function bringWindowForward(win) {
  if (!(win instanceof HTMLElement)) return;
  win.style.zIndex = String(bumpTopZ());
  scheduleWindowStateSave();
}

function ensureResizeEdges(win) {
  if (win.dataset.windowResizable === 'false') return;
  edgeNames.forEach((edge) => {
    if (win.querySelector(`:scope > .wm-resize-edge--${edge}`)) return;
    const handle = document.createElement('span');
    handle.className = `wm-resize-edge wm-resize-edge--${edge}`;
    handle.dataset.resizeEdge = edge;
    handle.setAttribute('aria-hidden', 'true');
    win.appendChild(handle);
  });
}

function canDragFrom(event, dragHandle) {
  if (event.target.closest('a, button, input, textarea, select, summary, .wm-resize-edge')) return false;
  return Boolean(dragHandle?.contains(event.target));
}

function floatWindowAtCurrentRect(win, stageRect, winRect) {
  win.classList.add('is-floating');
  win.style.left = `${winRect.left - stageRect.left}px`;
  win.style.top = `${winRect.top - stageRect.top}px`;
  win.style.width = `${winRect.width}px`;
  win.style.height = `${winRect.height}px`;
}

function attachDrag(win, stage) {
  const dragHandle = win.querySelector('.desktop-window__bar');
  win.addEventListener('pointerdown', (event) => {
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
      const nextLeft = clamp(startLeft + moveEvent.clientX - startX, 0, stageRect.width - winRect.width);
      const nextTop = clamp(startTop + moveEvent.clientY - startY, 0, stageRect.height - 40);
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

function attachResize(win, stage) {
  win.querySelectorAll(':scope > .wm-resize-edge').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
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

        if (edge === 'right') width = startWidth + dx;
        if (edge === 'bottom') height = startHeight + dy;
        if (edge === 'left') {
          width = startWidth - dx;
          left = startLeft + dx;
        }
        if (edge === 'top') {
          height = startHeight - dy;
          top = startTop + dy;
        }

        width = clamp(width, metrics.minWidth, Math.min(metrics.maxWidth, stageRect.width - left));
        height = clamp(height, metrics.minHeight, Math.min(metrics.maxHeight, stageRect.height - top));
        if (edge === 'left') left = startLeft + (startWidth - width);
        if (edge === 'top') top = startTop + (startHeight - height);

        win.style.left = `${clamp(left, 0, stageRect.width - metrics.minWidth)}px`;
        win.style.top = `${clamp(top, 0, stageRect.height - metrics.minHeight)}px`;
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

function attachControls(win) {
  win.querySelector('[data-window-action="close"]')?.addEventListener('click', () => {
    win.remove();
    saveWindowState();
  });

  win.querySelector('[data-window-action="minimize"]')?.addEventListener('click', () => {
    win.classList.toggle('is-minimized');
    saveWindowState();
  });

  win.querySelector('[data-window-action="maximize"]')?.addEventListener('click', () => {
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
    win.style.left = '12px';
    win.style.top = '64px';
    win.style.width = 'calc(100vw - 24px)';
    win.style.height = 'calc(100dvh - 76px)';
    bringWindowForward(win);
    saveWindowState();
  });
}

export function initWindowManager() {
  const stage = getStage();
  if (!stage) return;

  getDesktopWindows().forEach((win, index) => {
    applyWindowTokens(win);
    if (win.dataset.wmReady === 'true') return;
    win.dataset.wmReady = 'true';
    win.classList.add('wm-window');
    win.style.zIndex ||= String(100 + index);
    ensureResizeEdges(win);

    win.addEventListener('pointerdown', () => bringWindowForward(win));
    attachDrag(win, stage);
    attachResize(win, stage);
    attachControls(win);
  });
}
