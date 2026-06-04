import { getStage } from '../dom.js';
import { isStackedViewport } from '../viewport.js';
import { bumpTopZ, scheduleWindowStateSave } from '../windowState.js';

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
