import { createChatCompletion, fetchModels } from './llmClient.js';
import { buildSystemPrompt } from './llmContext.js';
import { getSettingsFields, loadSettings, readSettingsFromDom, saveSettings } from './llmSettings.js';
import { buildMessage, getConfigurationPrompt, getConversation, scrollToBottom } from './chatMessages.js';

function getModelDatalist(root) {
  return root.querySelector('[data-llm-chat-model-options]');
}

function escapeAttr(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getModelInput(root) {
  return root.querySelector('[data-llm-chat-model-input]');
}

function renderModelOptions(root, models) {
  const menu = getModelDatalist(root);
  const input = getModelInput(root);
  if (!menu || !(input instanceof HTMLInputElement)) return;

  root.llmModels = models;
  const query = input.value.trim().toLowerCase();
  const visible = models.filter((model) => model.toLowerCase().includes(query)).slice(0, 10);

  menu.innerHTML = visible.length
    ? visible.map((model) => `<button type="button" data-llm-chat-model-option="${escapeAttr(model)}">${escapeAttr(model)}</button>`).join('')
    : '<p>No models found</p>';
  menu.hidden = false;
}

async function refreshModels(root) {
  const settings = saveSettings(root);
  if (!settings.endpoint || !settings.apiKey) return;

  const currentRequest = new AbortController();
  root.llmModelsAbort?.abort();
  root.llmModelsAbort = currentRequest;

  try {
    const models = await fetchModels(settings, { signal: currentRequest.signal });
    renderModelOptions(root, models);
  } catch (error) {
    if (error.name !== 'AbortError') console.warn('[chat] could not load models', error);
  }
}

async function renderAssistantMessage(text) {
  const { renderMarkdown } = await import('./markdown.js');
  return buildMessage('assistant', text, { html: renderMarkdown(text) });
}

async function sendMessage(root, text, messages) {
  const settings = readSettingsFromDom(root);
  const conversation = [
    { role: 'system', content: buildSystemPrompt() },
    ...getConversation(messages),
  ];

  if (!settings.endpoint || !settings.apiKey) {
    messages.insertAdjacentHTML('beforeend', await renderAssistantMessage(getConfigurationPrompt()));
    scrollToBottom(messages);
    return;
  }

  const pending = buildMessage('assistant', 'Thinking…');
  messages.insertAdjacentHTML('beforeend', pending);
  const pendingEl = messages.lastElementChild;
  scrollToBottom(messages);

  try {
    const reply = await createChatCompletion(settings, conversation);
    pendingEl.outerHTML = await renderAssistantMessage(reply);
  } catch (error) {
    pendingEl.outerHTML = await renderAssistantMessage(`Dot tried to think, tripped over the provider cable, and face-planted. Please check the gear menu settings, then try again.\n\nError: ${error.message || 'Unknown error'}`);
  }

  scrollToBottom(messages);
}

function resetChat(root) {
  const messages = root?.querySelector?.('[data-llm-chat-messages]');
  if (!messages) return;
  messages.innerHTML = buildMessage('assistant', 'Hey there!');
}

function initClearChatControl() {
  if (window.__desktopChatClearReady) return;
  window.__desktopChatClearReady = true;

  window.addEventListener('desktop:chat-clear', (event) => {
    const win = event.detail?.window;
    const root = win?.querySelector?.('[data-llm-chat]');
    if (root) resetChat(root);
  });
}

function initChatRoot(root) {
  if (!(root instanceof HTMLElement) || root.dataset.llmChatReady === 'true') return;
  root.dataset.llmChatReady = 'true';

  const form = root.querySelector('[data-llm-chat-form]');
  const input = root.querySelector('[data-llm-chat-input]');
  const messages = root.querySelector('[data-llm-chat-messages]');
  if (!form || !(input instanceof HTMLTextAreaElement) || !messages) return;

  loadSettings(root);

  getSettingsFields(root).forEach((field) => {
    field.addEventListener('change', () => {
      saveSettings(root);
      if (field.dataset.llmChatSetting === 'endpoint' || field.dataset.llmChatSetting === 'apiKey') refreshModels(root);
    });
  });

  const modelInput = getModelInput(root);
  const modelMenu = getModelDatalist(root);
  modelInput?.addEventListener('focus', () => {
    if (Array.isArray(root.llmModels)) renderModelOptions(root, root.llmModels);
    else refreshModels(root);
  });
  modelInput?.addEventListener('input', () => {
    if (Array.isArray(root.llmModels)) renderModelOptions(root, root.llmModels);
    else refreshModels(root);
  });
  modelMenu?.addEventListener('click', (event) => {
    const option = event.target?.closest?.('[data-llm-chat-model-option]');
    if (!(option instanceof HTMLElement) || !(modelInput instanceof HTMLInputElement)) return;
    modelInput.value = option.dataset.llmChatModelOption || '';
    modelMenu.hidden = true;
    saveSettings(root);
  });
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) modelMenu.hidden = true;
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    saveSettings(root);
    messages.insertAdjacentHTML('beforeend', buildMessage('user', text));
    input.value = '';
    scrollToBottom(messages);
    sendMessage(root, text, messages);
  });
}

export function initChatApp() {
  initClearChatControl();
  document.querySelectorAll('[data-llm-chat]').forEach(initChatRoot);
}
