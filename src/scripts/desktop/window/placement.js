import { getStage } from '../dom.js';
import { desktopWorkAreaPad, desktopWorkAreaTop } from './workArea.js';

const windowCascadeOffset = { x: 28, y: 24 };
const windowStartPosition = { left: 36, top: desktopWorkAreaTop };

function getTopmostWindow() {
  const stage = getStage();
  if (!stage) return null;

  const windows = [...stage.querySelectorAll('.desktop-window')].filter(
    (win) => win instanceof HTMLElement && !win.classList.contains('is-minimized'),
  );
  if (windows.length === 0) return null;

  return windows.reduce((active, win) => {
    const activeZ = Number.parseInt(active.style.zIndex || '0', 10) || 0;
    const winZ = Number.parseInt(win.style.zIndex || '0', 10) || 0;
    return winZ >= activeZ ? win : active;
  }, windows[0]);
}

function measureWindowSpec(windowSpec) {
  const stage = getStage();
  if (!stage) return { width: 520, height: 360 };

  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  probe.style.width = windowSpec.width || `${windowSpec.minWidth || 520}px`;
  probe.style.height = windowSpec.height || `${windowSpec.minHeight || 360}px`;
  probe.style.minWidth = `${windowSpec.minWidth || 260}px`;
  probe.style.minHeight = `${windowSpec.minHeight || 180}px`;
  if (windowSpec.maxWidth) probe.style.maxWidth = `${windowSpec.maxWidth}px`;
  if (windowSpec.maxHeight) probe.style.maxHeight = `${windowSpec.maxHeight}px`;

  stage.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();

  return {
    width: rect.width || windowSpec.minWidth || 520,
    height: rect.height || windowSpec.minHeight || 360,
  };
}

export function defaultWindowRect(count, windowSpec) {
  const stage = getStage();
  const stageRect = stage?.getBoundingClientRect() || {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  const size = measureWindowSpec(windowSpec);
  const active = getTopmostWindow();

  let left = windowStartPosition.left + count * windowCascadeOffset.x;
  let top = windowStartPosition.top + count * windowCascadeOffset.y;

  if (active) {
    const activeRect = active.getBoundingClientRect();
    left = activeRect.left - stageRect.left + windowCascadeOffset.x;
    top = activeRect.top - stageRect.top + windowCascadeOffset.y;
  }

  const maxLeft = Math.max(desktopWorkAreaPad, stageRect.width - size.width - desktopWorkAreaPad);
  const maxTop = Math.max(
    windowStartPosition.top,
    stageRect.height - size.height - desktopWorkAreaPad,
  );

  if (left > maxLeft || top > maxTop) {
    left = windowStartPosition.left;
    top = windowStartPosition.top;
  }

  left = Math.max(desktopWorkAreaPad, Math.min(left, maxLeft));
  top = Math.max(windowStartPosition.top, Math.min(top, maxTop));

  return {
    left: `${Math.round(left)}px`,
    top: `${Math.round(top)}px`,
  };
}
