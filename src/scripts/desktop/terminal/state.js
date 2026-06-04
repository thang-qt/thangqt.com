export function getState(root) {
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

export function rememberCommand(root, command) {
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

export function navigateCommandHistory(root, input, direction) {
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

export function rememberDotTurn(root, command, reply) {
  const state = getState(root);
  state.messages.push(
    { role: 'user', content: `Terminal command: ${command}` },
    { role: 'assistant', content: reply },
  );

  while (state.messages.filter((message) => message.role === 'user').length > 12) {
    state.messages.shift();
  }
}
