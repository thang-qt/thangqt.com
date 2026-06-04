export const stackedViewportQuery = '(max-width: 1100px)';
export const mobileViewportQuery = '(max-width: 760px)';

export function isStackedViewport() {
  return window.matchMedia(stackedViewportQuery).matches;
}

export function isMobileViewport() {
  return window.matchMedia(mobileViewportQuery).matches;
}
