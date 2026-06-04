import { getStage } from '../dom.js';
import { isStackedViewport } from '../viewport.js';

export const desktopWorkAreaTop = 64;
export const desktopWorkAreaPad = 12;

export function numericStyle(value, fallback = 0) {
  const next = Number.parseFloat(value);
  return Number.isFinite(next) ? next : fallback;
}

export function floatWindowAtCurrentRect(win, stageRect, winRect) {
  win.classList.add('is-floating');
  win.style.left = `${Math.max(desktopWorkAreaPad, winRect.left - stageRect.left)}px`;
  win.style.top = `${Math.max(desktopWorkAreaTop, winRect.top - stageRect.top)}px`;
  win.style.width = `${winRect.width}px`;
  win.style.height = `${winRect.height}px`;
}

export function enforceDesktopWorkArea(win) {
  if (isStackedViewport() || !win.classList.contains('is-floating')) return;
  const stage = getStage();
  const stageRect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };
  const winRect = win.getBoundingClientRect();
  const top = numericStyle(win.style.top, winRect.top - stageRect.top);
  const left = numericStyle(win.style.left, winRect.left - stageRect.left);
  if (top < desktopWorkAreaTop) win.style.top = `${desktopWorkAreaTop}px`;
  if (left < desktopWorkAreaPad) win.style.left = `${desktopWorkAreaPad}px`;
}
