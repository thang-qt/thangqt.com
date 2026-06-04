import { applyWindowTokens, getDesktopWindows, getStage } from './dom.js';
import { attachControls } from './window/controls.js';
import { attachDrag } from './window/drag.js';
import { ensureResizeEdges, attachResize } from './window/resize.js';
import { initViewportResizeNudge } from './window/viewportNudge.js';
import { enforceDesktopWorkArea } from './window/workArea.js';
import { bringWindowForward } from './window/zIndex.js';

export { bringWindowForward };

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
