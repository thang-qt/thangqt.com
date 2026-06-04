import { llmSettingsKey, readStoredSettings } from '../llm/settings.js';
import { safeWriteJson } from '../storage.js';
import { getState } from './state.js';
import { syncPrompt } from './dom.js';

export function configureDot(root) {
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

export function handleConnectInput(root, value) {
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

  if (!settings.endpoint || !settings.apiKey)
    return ['connect failed: endpoint and API key are required.'];
  safeWriteJson(llmSettingsKey, settings);
  return [
    'Dot connection saved.',
    `endpoint: ${settings.endpoint}`,
    `model: ${settings.model}`,
    'api key: stored locally, not printed because we have manners.',
  ];
}
