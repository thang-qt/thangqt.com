import { addGlobalListenerOnce } from './events.js';
import { showDesktopNotification } from './notifications.js';
import { openInternalHref } from './router.js';
import { runCommand } from './terminal/commands.js';
import { isMobileViewport } from './viewport.js';

const CHALLENGE_PROMPT_KEY = 'desktop-challenge-prompted';
const CHALLENGE_PROMPT_SEEN_KEY = 'desktop-challenge-prompt-seen';
const CHALLENGE_ACTIVE_KEY = 'desktop-challenge-active';
const CHALLENGE_COMPLETE_KEY = 'desktop-challenge-complete';
const CHALLENGE_ENDS_AT_KEY = 'desktop-challenge-ends-at';
const CHALLENGE_INTERACTIONS_KEY = 'desktop-challenge-interactions';
const CHALLENGE_PROMPT_READY_KEY = 'desktop-challenge-prompt-ready';
const CHALLENGE_PROMPT_DELAY = 3 * 60 * 1000;
const CHALLENGE_PROMPT_MIN_INTERACTIONS = 3;
const CHALLENGE_DURATION = 10 * 60 * 1000;

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {}
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key);
  } catch {}
}

function canExposeChallenge() {
  return !isMobileViewport();
}

function isChallengeActive() {
  if (!canExposeChallenge()) return false;
  if (safeGet(sessionStorage, CHALLENGE_ACTIVE_KEY) !== 'true') return false;
  return getChallengeRemainingMs() > 0;
}

function setHidden(node, hidden) {
  if (!(node instanceof HTMLElement)) return;
  node.hidden = hidden;
  node.toggleAttribute('hidden', hidden);
  node.style.display = hidden ? 'none' : '';
}

function getChallengeRemainingMs() {
  const endsAt = Number(safeGet(sessionStorage, CHALLENGE_ENDS_AT_KEY) || 0);
  return Math.max(0, endsAt - Date.now());
}

function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getTimerEl() {
  return document.querySelector('[data-challenge-timer]');
}

function hideChallengeTimer() {
  const timer = getTimerEl();
  if (!timer) return;
  setHidden(timer, true);
  timer.textContent = '';
}

function captchaSolved(root) {
  return root?.dataset.challengeVerified === 'true';
}

function syncSettingsCodeVisibility() {
  const active = isChallengeActive();

  document.querySelectorAll('[data-challenge-code]').forEach((node) => {
    setHidden(node, !active);
  });

  document.querySelectorAll('[data-challenge-unlock]').forEach((node) => {
    const root = node.closest('[data-challenge-code]');
    setHidden(node, !active || !captchaSolved(root));
  });
}

function bindSettingsCaptcha() {
  document.querySelectorAll('[data-challenge-captcha]').forEach((node) => {
    if (!(node instanceof HTMLInputElement) || node.dataset.challengeCaptchaReady === 'true')
      return;
    node.dataset.challengeCaptchaReady = 'true';
    node.addEventListener('change', () => {
      const root = node.closest('[data-challenge-code]');
      if (!root) return;

      if (!node.checked) {
        root.dataset.challengeVerified = 'false';
        root.classList.remove('is-verifying', 'is-verified');
        syncSettingsCodeVisibility();
        return;
      }

      root.dataset.challengeVerified = 'false';
      root.classList.add('is-verifying');
      root.classList.remove('is-verified');
      node.disabled = true;
      syncSettingsCodeVisibility();

      window.setTimeout(() => {
        root.dataset.challengeVerified = 'true';
        root.classList.remove('is-verifying');
        root.classList.add('is-verified');
        node.disabled = false;
        syncSettingsCodeVisibility();
        showDesktopNotification({
          title: 'Verification passed',
          message: 'Outlet-adjacent superhero activity denied.',
          duration: 2800,
        });
      }, 900);
    });
  });
}

function stopChallengeTimer({ expired = false } = {}) {
  window.clearInterval(window.__desktopChallengeTimer);
  window.__desktopChallengeTimer = null;
  safeSet(sessionStorage, CHALLENGE_ACTIVE_KEY, 'false');
  safeRemove(sessionStorage, CHALLENGE_ENDS_AT_KEY);
  hideChallengeTimer();
  bindSettingsCaptcha();
  syncSettingsCodeVisibility();

  if (expired && safeGet(localStorage, CHALLENGE_COMPLETE_KEY) !== 'true') {
    showDesktopNotification({
      title: 'Challenge timed out',
      message: 'The tiny challenge went back into hiding.',
      duration: 4200,
    });
  }
}

function updateChallengeTimer() {
  const remaining = getChallengeRemainingMs();
  if (remaining <= 0) {
    stopChallengeTimer({ expired: true });
    return;
  }

  const timer = getTimerEl();
  if (!timer) return;
  setHidden(timer, false);
  timer.textContent = `FUN ${formatRemaining(remaining)}`;
  bindSettingsCaptcha();
  syncSettingsCodeVisibility();
}

function startChallengeTimer() {
  if (!canExposeChallenge()) return;
  safeSet(sessionStorage, CHALLENGE_PROMPT_KEY, 'true');
  safeSet(sessionStorage, CHALLENGE_ACTIVE_KEY, 'true');
  safeSet(sessionStorage, CHALLENGE_ENDS_AT_KEY, String(Date.now() + CHALLENGE_DURATION));
  window.clearInterval(window.__desktopChallengeTimer);
  updateChallengeTimer();
  window.__desktopChallengeTimer = window.setInterval(updateChallengeTimer, 1000);
}

function getTerminalRoot() {
  return document.querySelector('[data-terminal-app]');
}

async function openTerminalForChallenge() {
  if (!canExposeChallenge()) return;
  startChallengeTimer();
  await openInternalHref('/terminal', 'Terminal', { replaceExisting: true });

  window.setTimeout(() => {
    const terminal = getTerminalRoot();
    if (terminal) runCommand(terminal, 'challenge');
  }, 120);
}

function getChallengeInteractionCount() {
  return Number(safeGet(sessionStorage, CHALLENGE_INTERACTIONS_KEY) || 0);
}

function isPromptEligible() {
  return (
    safeGet(sessionStorage, CHALLENGE_PROMPT_READY_KEY) === 'true' &&
    getChallengeInteractionCount() >= CHALLENGE_PROMPT_MIN_INTERACTIONS
  );
}

function maybeShowChallengePrompt() {
  if (!canExposeChallenge()) return;
  if (safeGet(localStorage, CHALLENGE_COMPLETE_KEY) === 'true') return;
  if (safeGet(localStorage, CHALLENGE_PROMPT_SEEN_KEY) === 'true') return;
  if (isChallengeActive()) return;
  if (safeGet(sessionStorage, CHALLENGE_PROMPT_KEY) === 'true') return;
  if (!isPromptEligible()) return;
  safeSet(sessionStorage, CHALLENGE_PROMPT_KEY, 'true');
  safeSet(localStorage, CHALLENGE_PROMPT_SEEN_KEY, 'true');

  showDesktopNotification({
    title: 'Are you down for some fun?',
    message: 'I hid a tiny challenge in here.',
    duration: Number.POSITIVE_INFINITY,
    actions: [
      {
        label: 'Start challenge',
        event: 'desktop:challenge-start',
        detail: { source: 'notification' },
      },
      { label: 'Not now' },
    ],
  });
}

function trackChallengeInteraction() {
  if (!canExposeChallenge()) return;
  if (safeGet(localStorage, CHALLENGE_COMPLETE_KEY) === 'true') return;
  if (isChallengeActive()) return;
  if (safeGet(sessionStorage, CHALLENGE_PROMPT_KEY) === 'true') return;

  const nextCount = getChallengeInteractionCount() + 1;
  safeSet(sessionStorage, CHALLENGE_INTERACTIONS_KEY, String(nextCount));
  maybeShowChallengePrompt();
}

function markPromptReady() {
  if (!canExposeChallenge()) return;
  safeSet(sessionStorage, CHALLENGE_PROMPT_READY_KEY, 'true');
  maybeShowChallengePrompt();
}

function handleChallengeStart() {
  openTerminalForChallenge();
}

function handleChallengeActivate() {
  if (!isChallengeActive()) startChallengeTimer();
}

export function markFunFactUnlocked() {
  safeSet(localStorage, CHALLENGE_COMPLETE_KEY, 'true');
  stopChallengeTimer();

  showDesktopNotification({
    title: 'Challenge complete',
    message: 'Childhood incident report unlocked. Mischief justified.',
    duration: 5200,
  });
}

export function initDesktopChallenge() {
  addGlobalListenerOnce(
    'desktop-challenge:start',
    window,
    'desktop:challenge-start',
    handleChallengeStart,
  );
  addGlobalListenerOnce(
    'desktop-challenge:activate',
    window,
    'desktop:challenge-activate',
    handleChallengeActivate,
  );
  addGlobalListenerOnce(
    'desktop-challenge:complete',
    window,
    'desktop:challenge-complete',
    markFunFactUnlocked,
  );
  addGlobalListenerOnce(
    'desktop-challenge:content-change',
    window,
    'desktop:content-change',
    () => {
      bindSettingsCaptcha();
      syncSettingsCodeVisibility();
      trackChallengeInteraction();
    },
  );
  addGlobalListenerOnce(
    'desktop-challenge:pointer-interaction',
    document,
    'pointerdown',
    trackChallengeInteraction,
  );
  addGlobalListenerOnce(
    'desktop-challenge:key-interaction',
    document,
    'keydown',
    trackChallengeInteraction,
  );

  if (isChallengeActive()) {
    updateChallengeTimer();
    window.__desktopChallengeTimer = window.setInterval(updateChallengeTimer, 1000);
  } else {
    hideChallengeTimer();
    bindSettingsCaptcha();
    syncSettingsCodeVisibility();
  }

  window.setTimeout(markPromptReady, CHALLENGE_PROMPT_DELAY);
}
