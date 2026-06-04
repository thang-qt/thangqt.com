import { escapeHtml } from '../dom.js';

export function scrollToTerminalBottom(screen) {
  screen.scrollTop = screen.scrollHeight;
  requestAnimationFrame(() => {
    screen.scrollTop = screen.scrollHeight;
  });
}

export function appendLine(screen, html, className = '') {
  const line = document.createElement('p');
  if (className) line.className = className;
  line.innerHTML = html;
  screen.appendChild(line);
  scrollToTerminalBottom(screen);
}

export function appendOutput(screen, lines) {
  lines.forEach((line) => appendLine(screen, escapeHtml(line)));
}

export function startDots(screen, line, prefix = '') {
  let count = 1;
  line.textContent = `${prefix}.`;
  scrollToTerminalBottom(screen);
  const timer = window.setInterval(() => {
    count = count >= 3 ? 1 : count + 1;
    line.textContent = `${prefix}${'.'.repeat(count)}`;
    scrollToTerminalBottom(screen);
  }, 320);
  return () => window.clearInterval(timer);
}

export function syncPrompt(root) {
  const label = root.querySelector('[data-terminal-prompt-label]');
  const input = root.querySelector('[data-terminal-input]');
  const state = root.__terminalState;

  if (state?.connectFlow?.step) {
    const prompt = state.connectFlow.step === 'apiKey' ? 'connect api-key' : `connect ${state.connectFlow.step}`;
    if (label) label.textContent = prompt;
    if (input instanceof HTMLInputElement) input.type = state.connectFlow.step === 'apiKey' ? 'password' : 'text';
    return;
  }

  if (label) label.textContent = `guest@thangqt ${state?.cwd || '~'}`;
  if (input instanceof HTMLInputElement) input.type = 'text';
}
