import {
  applyWindowTokens,
  clamp,
  getDesktopWindows,
  getStage,
  readWindowMetrics,
} from './dom.js';
import { bumpTopZ, saveWindowState, scheduleWindowStateSave } from './windowState.js';

const edgeNames = ['top', 'right', 'bottom', 'left', 'top-right', 'bottom-right', 'bottom-left', 'top-left'];
const stackedQuery = '(max-width: 1100px)';
const desktopWorkAreaTop = 64;
const desktopWorkAreaPad = 12;

function isStackedViewport() {
  return window.matchMedia(stackedQuery).matches;
}

function numericStyle(value, fallback = 0) {
  const next = Number.parseFloat(value);
  return Number.isFinite(next) ? next : fallback;
}

function enforceDesktopWorkArea(win) {
  if (isStackedViewport() || !win.classList.contains('is-floating')) return;
  const stage = getStage();
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };
  const winRect = win.getBoundingClientRect();
  const top = numericStyle(win.style.top, winRect.top - stageRect.top);
  const left = numericStyle(win.style.left, winRect.left - stageRect.left);
  if (top < desktopWorkAreaTop) win.style.top = `${desktopWorkAreaTop}px`;
  if (left < desktopWorkAreaPad) win.style.left = `${desktopWorkAreaPad}px`;
}

export function bringWindowForward(win) {
  if (!(win instanceof HTMLElement)) return;
  win.style.zIndex = String(bumpTopZ());

  if (isStackedViewport()) {
    const stage = getStage();
    if (stage?.contains(win) && stage.firstElementChild !== win) {
      stage.prepend(win);
    }
  }

  scheduleWindowStateSave();
}

function ensureResizeEdges(win) {
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

function canDragFrom(event, dragHandle) {
  if (event.target.closest('a, button, input, textarea, select, summary, .wm-resize-edge')) return false;
  return Boolean(dragHandle?.contains(event.target));
}

function floatWindowAtCurrentRect(win, stageRect, winRect) {
  win.classList.add('is-floating');
  win.style.left = `${Math.max(desktopWorkAreaPad, winRect.left - stageRect.left)}px`;
  win.style.top = `${Math.max(desktopWorkAreaTop, winRect.top - stageRect.top)}px`;
  win.style.width = `${winRect.width}px`;
  win.style.height = `${winRect.height}px`;
}

function attachDrag(win, stage) {
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

function attachResize(win, stage) {
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

function toggleMaximize(win) {
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
  win.style.left = '12px';
  win.style.top = `${desktopWorkAreaTop}px`;
  win.style.width = 'calc(100vw - 24px)';
  win.style.height = `calc(100dvh - ${desktopWorkAreaTop + desktopWorkAreaPad}px)`;
  bringWindowForward(win);
  saveWindowState();
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

  const maximizeButton = win.querySelector('[data-window-action="maximize"]');
  if (win.dataset.windowMaximizable === 'false') {
    maximizeButton?.setAttribute('hidden', '');
    maximizeButton?.setAttribute('aria-hidden', 'true');
  }

  maximizeButton?.addEventListener('click', () => toggleMaximize(win));

}

export function initWindowManager() {
  const stage = getStage();
  if (!stage) return;

  getDesktopWindows().forEach((win, index) => {
    applyWindowTokens(win);
    enforceDesktopWorkArea(win);
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

  initViewportResizeNudge(stage);
}

/**
 * On viewport resize, nudge floating windows so they stay inside the
 * available work area. Skips windows that are stacked (narrow viewport).
 */
let resizeRafId = 0;

function initViewportResizeNudge(stage) {
  if (window.__wmResizeNudgeReady) return;
  window.__wmResizeNudgeReady = true;

  window.addEventListener('resize', () => {
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

    // Clamp width/height to new stage size
    const maxW = Math.max(metrics.minWidth, stageRect.width - desktopWorkAreaPad * 2);
    const maxH = Math.max(metrics.minHeight, stageRect.height - desktopWorkAreaTop - desktopWorkAreaPad);
    if (width > maxW) { width = maxW; win.style.width = `${width}px`; }
    if (height > maxH) { height = maxH; win.style.height = `${height}px`; }

    // Nudge position so right/bottom edges stay in view
    const rightEdge = left + width;
    if (rightEdge > maxRight) left = Math.max(desktopWorkAreaPad, maxRight - width);
    const bottomEdge = top + height;
    if (bottomEdge > maxBottom) top = Math.max(desktopWorkAreaTop, maxBottom - height);

    // Clamp to top-left boundaries
    left = Math.max(desktopWorkAreaPad, left);
    top = Math.max(desktopWorkAreaTop, top);

    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
  });

  scheduleWindowStateSave();
}

