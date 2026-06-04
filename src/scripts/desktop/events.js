const onceKeys = new Set();

export function runOnce(key, setup) {
  if (onceKeys.has(key)) return false;
  onceKeys.add(key);
  setup();
  return true;
}

export function addGlobalListenerOnce(key, target, type, listener, options) {
  return runOnce(`listener:${key}`, () => target.addEventListener(type, listener, options));
}

export function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
  );
}
