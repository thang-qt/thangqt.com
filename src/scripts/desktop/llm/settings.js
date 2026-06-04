import { safeReadJson, safeWriteJson } from '../storage.js';

export const llmSettingsKey = 'desktop-llm-chat-settings';

export function getSettingsFields(root) {
  return [...root.querySelectorAll('[data-llm-chat-setting]')];
}

export function readStoredSettings() {
  return safeReadJson(llmSettingsKey, {});
}

export function readSettingsFromDom(root) {
  const settings = {};
  getSettingsFields(root).forEach((field) => {
    if (field instanceof HTMLInputElement) settings[field.dataset.llmChatSetting] = field.value.trim();
  });
  return settings;
}

export function loadSettings(root) {
  const settings = readStoredSettings();
  getSettingsFields(root).forEach((field) => {
    if (field instanceof HTMLInputElement) field.value = settings[field.dataset.llmChatSetting] || '';
  });
  return settings;
}

export function saveSettings(root) {
  const settings = readSettingsFromDom(root);
  safeWriteJson(llmSettingsKey, settings);
  return settings;
}

export function normalizeEndpoint(endpoint = '') {
  return endpoint.trim().replace(/\/+$/, '');
}
