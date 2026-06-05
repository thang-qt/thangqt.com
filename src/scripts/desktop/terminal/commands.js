import { escapeHtml } from '../dom.js';
import { readStoredSettings } from '../llm/settings.js';
import { openInternalHref } from '../router.js';
import { configureDot, handleConnectInput } from './connect.js';
import { appendLine, appendOutput, scrollToTerminalBottom, startDots, syncPrompt } from './dom.js';
import { askDot, getDotConfigStatus } from './dot.js';
import {
  formatList,
  getHelpLines,
  getNode,
  normalizePath,
  openCommands,
  splitArgs,
} from './fileSystem.js';
import { getState } from './state.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runBasicCommand(root, args) {
  const state = getState(root);
  const [name, target] = args;

  if (name === 'help') return getHelpLines(state.upgraded);
  if (name === 'pwd') return [state.cwd];
  if (name === 'config') return getDotConfigStatus();
  if (name === 'connect' || name === 'configure') return configureDot(root);

  if (name === 'ls') {
    const path = normalizePath(state.cwd, target || state.cwd);
    const node = getNode(path);
    if (!node) return [`ls: ${target}: No such file or directory`];
    if (node.type !== 'dir') return [target || path];
    return formatList(node);
  }

  if (name === 'cd') {
    const path = normalizePath(state.cwd, target || '~');
    const node = getNode(path);
    if (!node) return [`cd: ${target}: No such file or directory`];
    if (node.type !== 'dir') return [`cd: ${target}: Not a directory`];
    state.cwd = path;
    syncPrompt(root);
    return [];
  }

  if (name === 'cat') {
    if (!target) return ['cat: missing file operand'];
    const path = normalizePath(state.cwd, target);
    const node = getNode(path);
    if (!node) return [`cat: ${target}: No such file or directory`];
    if (node.type !== 'file') return [`cat: ${target}: Is a directory`];
    return node.content;
  }

  return null;
}

async function runUpgrade(screen, state) {
  const settings = readStoredSettings();
  const steps = [
    'Installing unnecessary confidence',
    'Locating Dot, the advanced intelligent mind from the chat app',
  ];

  for (const step of steps) {
    appendLine(screen, '', 'terminal-muted');
    const line = screen.lastElementChild;
    const stop = startDots(screen, line, `${step} `);
    await sleep(900);
    stop();
    line.textContent = `${step} ... done`;
    scrollToTerminalBottom(screen);
  }

  if (!settings.endpoint?.trim() || !settings.apiKey?.trim()) {
    appendOutput(screen, [
      'Upgrade failed: found Dot, but Dot is missing its thinking credentials.',
      'Open Chat → gear, configure an OpenAI-compatible endpoint/key, then run `upgrade` again.',
    ]);
    return;
  }

  appendLine(screen, '', 'terminal-muted');
  const line = screen.lastElementChild;
  const stop = startDots(screen, line, 'Teaching shell etiquette to a language model ');
  await sleep(900);
  stop();
  line.textContent = 'Teaching shell etiquette to a language model ... done';
  scrollToTerminalBottom(screen);

  state.upgraded = true;
  appendOutput(screen, [
    'Upgrade complete.',
    'Dot is now driving the shell. If it hallucinates, please nod politely.',
  ]);
}

function openAppFromTerminal(screen, app) {
  openInternalHref(app.href, app.title, { replaceExisting: true });
  appendLine(screen, `opening ${escapeHtml(app.title)}…`, 'terminal-muted');
}

export async function runCommand(root, rawCommand) {
  const screen = root.querySelector('[data-terminal-screen]');
  if (!screen) return;

  const command = rawCommand.trim();
  const state = getState(root);
  const promptLabel = state.connectFlow?.step
    ? state.connectFlow.step === 'apiKey'
      ? 'connect api-key'
      : `connect ${state.connectFlow.step}`
    : `guest@thangqt ${state.cwd}`;
  const displayCommand =
    state.connectFlow?.step === 'apiKey' && command && command.toLowerCase() !== 'cancel'
      ? '••••••••'
      : command;
  appendLine(screen, `<span class="terminal-history-prompt">${escapeHtml(promptLabel)}</span>`);
  appendLine(screen, `<span class="terminal-prompt-mark">❯</span> ${escapeHtml(displayCommand)}`);

  if (state.connectFlow) {
    appendOutput(screen, handleConnectInput(root, command) || []);
    return;
  }

  if (!command) return;
  if (command === 'clear') {
    screen.innerHTML = '';
    return;
  }

  const args = splitArgs(command);
  const [name, maybeApp] = args;

  if (state.upgraded && (name === 'connect' || name === 'configure' || name === 'config')) {
    appendOutput(screen, name === 'config' ? getDotConfigStatus() : configureDot(root));
    return;
  }

  if (name === 'upgrade') {
    await runUpgrade(screen, state);
    return;
  }

  if (!state.upgraded) {
    if (name === 'open') {
      const app = openCommands[maybeApp];
      if (!app)
        return appendLine(screen, `open: expected one of ${Object.keys(openCommands).join(', ')}`);
      openAppFromTerminal(screen, app);
      return;
    }

    if (openCommands[name]) {
      openAppFromTerminal(screen, openCommands[name]);
      return;
    }

    const output = runBasicCommand(root, args);
    if (output) {
      appendOutput(screen, output);
      return;
    }

    appendOutput(screen, [
      `command not found: ${name}`,
      'Run `upgrade` if you want Dot to make an educated mess of it.',
    ]);
    return;
  }

  appendLine(screen, '', 'terminal-muted');
  const pending = screen.lastElementChild;
  const stopDots = pending ? startDots(screen, pending) : () => {};
  try {
    const reply = await askDot(root, command);
    stopDots();
    pending?.remove();
    appendOutput(screen, reply);
  } catch (error) {
    stopDots();
    pending?.remove();
    appendOutput(screen, [
      'Dot tripped over the provider cable.',
      `Error: ${error.message || 'Unknown error'}`,
    ]);
  }
}
