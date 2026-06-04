import { createChatCompletion } from './llmClient.js';
import { buildSystemPrompt } from './llmContext.js';
import { llmSettingsKey, readStoredSettings } from './llmSettings.js';
import { openInternalHref } from './router.js';

const openCommands = {
  projects: { href: '/projects', title: 'Projects' },
  writing: { href: '/writing', title: 'Writing' },
  links: { href: '/links', title: 'Links' },
  settings: { href: '/settings', title: 'Settings' },
  chat: { href: '/chat', title: 'Chat' },
};

const basicFiles = {
  '~': {
    type: 'dir',
    children: {
      'README.txt': {
        type: 'file',
        content: [
          'Welcome to the home directory.',
          'Most useful things are probably somewhere else.',
          'Run `upgrade` when the shell starts feeling too small.',
        ],
      },
      'dot.txt': {
        type: 'file',
        content: [
          'Dot is the small AI mind that powers the chat app.',
          'Run `connect` to configure Dot, then `upgrade` to let it take over unknown terminal commands.',
        ],
      },
      'resume.txt': {
        type: 'file',
        content: [
          'Are you a recruiter?',
          'If not, please stop reading and go discover something else.',
          '...',
          '...',
          'STOP. Why are you still reading?',
          '...',
          'Okay, so I guess you are a recruiter then.',
          'Hold on. I am thinking of something professional to say.',
          '...',
          'I am handsome, intelligent, extremely mature, and possibly the most sane person on earth.',
          'I also bring strong synergy, scalable vibes, and a proven ability to name files poorly.',
          'Okay, I am kidding.',
          'I am just another guy who loves tinkering, building small things, and making computers slightly more personal.',
          '*awkward stare*',
          'But seriously:',
          'HIRE ME',
        ],
      },
      projects: {
        type: 'dir',
        children: {
          'README.md': {
            type: 'file',
            content: [
              'A drawer full of prototypes, good intentions, and one CSS decision I refuse to discuss.',
              'Some projects are finished. Some are "finished" in the software sense.',
              'Run `open projects` to browse them.',
            ],
          },
          'definitely-final-v2.txt': {
            type: 'file',
            content: ['final_v2_revised_REAL_final_use_this_one.txt was moved to another universe.'],
          },
        },
      },
      writing: {
        type: 'dir',
        children: {
          'README.md': {
            type: 'file',
            content: [
              'Drafts, notes, essays, and several titles that arrived before the actual thoughts.',
              'The cursor blinked here for a very long time.',
              'Run `open writing` to read posts.',
            ],
          },
          'draft-that-will-totally-be-finished.txt': {
            type: 'file',
            content: ['Status: emotionally complete, textually absent.'],
          },
        },
      },
      downloads: {
        type: 'dir',
        children: {
          'linux-iso-actually-final.iso': {
            type: 'file',
            content: ['0 bytes', 'Downloaded successfully, emotionally speaking.'],
          },
          'todo-from-2021.txt': {
            type: 'file',
            content: ['- learn vim', '- become a morning person', '- rename this file'],
          },
          'wallpaper-37.png': {
            type: 'file',
            content: ['This is not an image. This is a lifestyle choice with a .png extension.'],
          },
        },
      },
      notes: {
        type: 'dir',
        children: {
          'ideas.txt': {
            type: 'file',
            content: ['app idea: calendar that gently judges you', 'site idea: terminal that should probably stop lying'],
          },
          'meeting-notes.txt': {
            type: 'file',
            content: ['Attendees: me', 'Decision: postpone decision', 'Action item: create better action item'],
          },
          'names.txt': {
            type: 'file',
            content: ['Dot', 'ThangOS', 'Untitled Final Name', 'Naming things remains impossible.'],
          },
        },
      },
      suspicious: {
        type: 'dir',
        children: {
          'passwords.txt': {
            type: 'file',
            content: ['hunter2', 'just kidding. please use a password manager.'],
          },
          'taxes-2025.txt': {
            type: 'file',
            content: ['This folder has been staring at me since April.'],
          },
          'do-not-cat.txt': {
            type: 'file',
            content: ['You had one job.', 'The file is disappointed but not surprised.'],
          },
          '.totally-not-a-secret': {
            type: 'file',
            content: ['The secret is that there is no secret.', 'This has not stopped the folder from acting mysterious.'],
          },
        },
      },
    },
  },
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scrollToTerminalBottom(screen) {
  screen.scrollTop = screen.scrollHeight;
  requestAnimationFrame(() => {
    screen.scrollTop = screen.scrollHeight;
  });
}

function appendLine(screen, html, className = '') {
  const line = document.createElement('p');
  if (className) line.className = className;
  line.innerHTML = html;
  screen.appendChild(line);
  scrollToTerminalBottom(screen);
}

function appendOutput(screen, lines) {
  lines.forEach((line) => appendLine(screen, escapeHtml(line)));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startDots(screen, line, prefix = '') {
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

function getState(root) {
  if (!root.__terminalState) {
    root.__terminalState = {
      cwd: '~',
      upgraded: false,
      messages: [],
      connectFlow: null,
      history: [],
      historyIndex: null,
      historyDraft: '',
    };
  }
  return root.__terminalState;
}

function rememberCommand(root, command) {
  const state = getState(root);
  if (!command || state.connectFlow) return;

  if (state.history.at(-1) !== command) state.history.push(command);
  while (state.history.length > 80) state.history.shift();
  state.historyIndex = null;
  state.historyDraft = '';
}

function setInputValue(input, value) {
  input.value = value;
  const end = input.value.length;
  requestAnimationFrame(() => input.setSelectionRange(end, end));
}

function navigateCommandHistory(root, input, direction) {
  const state = getState(root);
  if (state.connectFlow || !state.history.length) return false;

  if (direction === 'up') {
    if (state.historyIndex === null) {
      state.historyDraft = input.value;
      state.historyIndex = state.history.length - 1;
    } else {
      state.historyIndex = Math.max(0, state.historyIndex - 1);
    }
    setInputValue(input, state.history[state.historyIndex] || '');
    return true;
  }

  if (state.historyIndex === null) return false;
  state.historyIndex += 1;
  if (state.historyIndex >= state.history.length) {
    state.historyIndex = null;
    setInputValue(input, state.historyDraft || '');
    state.historyDraft = '';
    return true;
  }

  setInputValue(input, state.history[state.historyIndex] || '');
  return true;
}

function rememberDotTurn(root, command, reply) {
  const state = getState(root);
  state.messages.push(
    { role: 'user', content: `Terminal command: ${command}` },
    { role: 'assistant', content: reply },
  );

  while (state.messages.filter((message) => message.role === 'user').length > 12) {
    state.messages.shift();
  }
}

function syncPrompt(root) {
  const label = root.querySelector('[data-terminal-prompt-label]');
  const input = root.querySelector('[data-terminal-input]');
  const state = getState(root);

  if (state.connectFlow?.step) {
    const prompt = state.connectFlow.step === 'apiKey' ? 'connect api-key' : `connect ${state.connectFlow.step}`;
    if (label) label.textContent = prompt;
    if (input instanceof HTMLInputElement) input.type = state.connectFlow.step === 'apiKey' ? 'password' : 'text';
    return;
  }

  if (label) label.textContent = `guest@thangqt ${state.cwd}`;
  if (input instanceof HTMLInputElement) input.type = 'text';
}

function splitArgs(command) {
  return command.trim().split(/\s+/).filter(Boolean);
}

function normalizePath(cwd, target = '') {
  const raw = target || cwd;
  const parts = raw.startsWith('~') ? [] : cwd.replace(/^~\/?/, '').split('/').filter(Boolean);

  raw.replace(/^~\/?/, '').split('/').filter(Boolean).forEach((part) => {
    if (part === '.') return;
    if (part === '..') parts.pop();
    else parts.push(part);
  });

  return parts.length > 0 ? `~/${parts.join('/')}` : '~';
}

function getNode(path) {
  const parts = path.replace(/^~\/?/, '').split('/').filter(Boolean);
  let node = basicFiles['~'];
  for (const part of parts) {
    if (node?.type !== 'dir') return null;
    node = node.children?.[part];
  }
  return node || null;
}

function formatList(node) {
  return Object.entries(node.children || {})
    .map(([name, child]) => child.type === 'dir' ? `${name}/` : name)
    .sort((a, b) => a.localeCompare(b));
}

function help(upgraded = false) {
  return [
    'Available commands:',
    '  help              Show this help',
    '  pwd               Print current directory',
    '  ls [dir]          List files',
    '  cd [dir]          Change directory',
    '  cat <file>        Read a file',
    '  open <app>        Open projects, writing, links, settings, or chat',
    '  clear             Clear the terminal',
    '  connect           Configure Dot provider credentials',
    '  config            Show Dot connection status',
    '  upgrade           Invite Dot to handle unknown commands',
    upgraded ? '' : 'Tip: this shell is intentionally tiny. `upgrade` makes it weirder.',
  ].filter(Boolean);
}

function getDotConfigStatus() {
  const settings = readStoredSettings();
  const endpoint = settings.endpoint?.trim();
  const apiKey = settings.apiKey?.trim();
  const model = settings.model?.trim();

  if (!endpoint || !apiKey) return ['Dot is not connected.', 'Run `connect` to configure endpoint/key from the terminal.'];
  return [
    'Dot is connected.',
    `endpoint: ${endpoint}`,
    `model: ${model || 'default'}`,
    `api key: ${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`,
  ];
}

function configureDot(root) {
  const state = getState(root);
  state.connectFlow = {
    step: 'endpoint',
    values: {},
    current: readStoredSettings(),
  };
  syncPrompt(root);
  return [
    'Starting Dot connection wizard.',
    'Type `cancel` anytime to stop.',
    `endpoint [${state.connectFlow.current.endpoint || 'OpenAI-compatible base URL'}]:`,
  ];
}

function handleConnectInput(root, value) {
  const state = getState(root);
  const flow = state.connectFlow;
  if (!flow) return null;

  const input = value.trim();
  if (input.toLowerCase() === 'cancel') {
    state.connectFlow = null;
    syncPrompt(root);
    return ['connect cancelled. Dot put the cable back in the drawer.'];
  }

  if (flow.step === 'endpoint') {
    flow.values.endpoint = input || flow.current.endpoint || '';
    flow.step = 'apiKey';
    syncPrompt(root);
    return [`api key [${flow.current.apiKey ? 'saved key' : 'required'}]:`];
  }

  if (flow.step === 'apiKey') {
    flow.values.apiKey = input || flow.current.apiKey || '';
    flow.step = 'model';
    syncPrompt(root);
    return [`model [${flow.current.model || 'gpt-4o-mini'}]:`];
  }

  flow.values.model = input || flow.current.model || 'gpt-4o-mini';
  const settings = {
    endpoint: flow.values.endpoint.trim(),
    apiKey: flow.values.apiKey.trim(),
    model: flow.values.model.trim() || 'gpt-4o-mini',
  };
  state.connectFlow = null;
  syncPrompt(root);

  if (!settings.endpoint || !settings.apiKey) return ['connect failed: endpoint and API key are required.'];
  localStorage.setItem(llmSettingsKey, JSON.stringify(settings));
  return [
    'Dot connection saved.',
    `endpoint: ${settings.endpoint}`,
    `model: ${settings.model}`,
    'api key: stored locally, not printed because we have manners.',
  ];
}

function runBasicCommand(root, args) {
  const state = getState(root);
  const [name, target] = args;

  if (name === 'help') return help(state.upgraded);
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

async function askDot(root, command) {
  const settings = readStoredSettings();
  if (!settings.endpoint || !settings.apiKey) {
    return [
      'Dot pats its pockets and finds no API key.',
      'Open Chat → gear, configure an OpenAI-compatible endpoint/key, then try again.',
    ];
  }

  const state = getState(root);
  const context = [
    buildSystemPrompt(),
    'You are currently answering inside a playful fake terminal on thangqt.com.',
    'Return plaintext only. No Markdown, no code fences.',
    'Return only the expected output of the command. Do not explain what you are doing. Do not add commentary, greetings, apologies, or extra response text.',
    'Interpret the user input as a terminal command and produce the kind of output that command would show.',
    'You may be playful inside the generated output itself. For example, if the command is neofetch, output a neofetch-like system card with made-up OS/host/kernel/uptime/package/theme details. If the command is fortune, output a fortune. If the command is cowsay hello, output cowsay-style text.',
    'For commands that normally have no output, such as cd, touch, mkdir, or export, return a very short terminal-like confirmation with a light joke instead of an empty response.',
    'Use the previous terminal conversation for follow-up commands, references, and edits to earlier output.',
    'Be concise and terminal-like. Do not claim to have executed real destructive/network/system-changing commands; for those, return a harmless plausible dry-run/status output.',
    `Current fake directory: ${state.cwd}`,
  ].join('\n\n');

  const reply = await createChatCompletion(settings, [
    { role: 'system', content: context },
    ...state.messages,
    { role: 'user', content: `Terminal command: ${command}` },
  ]);

  rememberDotTurn(root, command, reply);
  return reply.split('\n');
}

async function runCommand(root, rawCommand) {
  const screen = root.querySelector('[data-terminal-screen]');
  if (!screen) return;

  const command = rawCommand.trim();
  const state = getState(root);
  const promptLabel = state.connectFlow?.step
    ? (state.connectFlow.step === 'apiKey' ? 'connect api-key' : `connect ${state.connectFlow.step}`)
    : `guest@thangqt ${state.cwd}`;
  const displayCommand = state.connectFlow?.step === 'apiKey' && command && command.toLowerCase() !== 'cancel'
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
      'Unknown commands will now be interpreted by Dot. If it hallucinates, please nod politely.',
    ]);
    return;
  }

  if (!state.upgraded) {
    if (name === 'open') {
      const app = openCommands[maybeApp];
      if (!app) return appendLine(screen, `open: expected one of ${Object.keys(openCommands).join(', ')}`);
      openInternalHref(app.href, app.title, { replaceExisting: true });
      appendLine(screen, `opening ${escapeHtml(app.title)}…`, 'terminal-muted');
      return;
    }

    if (openCommands[name]) {
      const app = openCommands[name];
      openInternalHref(app.href, app.title, { replaceExisting: true });
      appendLine(screen, `opening ${escapeHtml(app.title)}…`, 'terminal-muted');
      return;
    }

    const output = runBasicCommand(root, args);
    if (output) {
      appendOutput(screen, output);
      return;
    }

    appendOutput(screen, [`command not found: ${name}`, 'Run `upgrade` if you want Dot to make an educated mess of it.']);
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

function initTerminalRoot(root) {
  if (!(root instanceof HTMLElement) || root.dataset.terminalReady === 'true') return;
  root.dataset.terminalReady = 'true';
  syncPrompt(root);

  const form = root.querySelector('[data-terminal-form]');
  const input = root.querySelector('[data-terminal-input]');
  if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) return;

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
