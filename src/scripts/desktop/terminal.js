import { showDesktopNotification } from './notifications.js';
import { runCommand } from './terminal/commands.js';
import { syncPrompt } from './terminal/dom.js';
import { getState, navigateCommandHistory, rememberCommand } from './terminal/state.js';

const TERMINAL_CAT_WARNING_KEY = 'desktop-terminal-cat-warning-shown';

function showTerminalCatWarning() {
  try {
    if (sessionStorage.getItem(TERMINAL_CAT_WARNING_KEY) === 'true') return;
    sessionStorage.setItem(TERMINAL_CAT_WARNING_KEY, 'true');
  } catch {}

  window.setTimeout(() => {
    showDesktopNotification({
      title: 'Terminal safety notice',
      message: 'A dangerous cat is contained somewhere in this filesystem. Do not release it.',
      duration: 5200,
    });
  }, 650);
}

function initTerminalRoot(root) {
  if (!(root instanceof HTMLElement) || root.dataset.terminalReady === 'true') return;
  root.dataset.terminalReady = 'true';
  getState(root);
  syncPrompt(root);
  showTerminalCatWarning();

  const form = root.querySelector('[data-terminal-form]');
  const input = root.querySelector('[data-terminal-input]');
  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) return;

  requestAnimationFrame(() => input.focus({ preventScroll: true }));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = input.value;
    rememberCommand(root, command.trim());
    input.value = '';
    runCommand(root, command);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (!navigateCommandHistory(root, input, event.key === 'ArrowUp' ? 'up' : 'down')) return;
    event.preventDefault();
  });

  root.addEventListener('click', (event) => {
    const runButton = event.target?.closest?.('[data-terminal-run]');
    if (runButton instanceof HTMLElement) {
      runCommand(root, runButton.dataset.terminalRun || 'help');
      input.focus();
      return;
    }
    input.focus();
  });
}

export function initTerminalApp() {
  document.querySelectorAll('[data-terminal-app]').forEach(initTerminalRoot);
}
