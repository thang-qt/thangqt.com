import { normalizeEndpoint } from './settings.js';

function ensureConfig(settings) {
  const endpoint = normalizeEndpoint(settings.endpoint || '');
  const apiKey = settings.apiKey || '';
  if (!endpoint) throw new Error('Missing provider endpoint. Open settings and enter an OpenAI-compatible base URL.');
  if (!apiKey) throw new Error('Missing API key. Open settings and enter your provider key.');
  return { endpoint, apiKey, model: settings.model || 'gpt-4o-mini' };
}

function authHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchModels(settings, { signal } = {}) {
  const { endpoint, apiKey } = ensureConfig(settings);
  const response = await fetch(`${endpoint}/models`, {
    method: 'GET',
    headers: authHeaders(apiKey),
    signal,
  });

  if (!response.ok) throw new Error(`Models request failed (${response.status})`);
  const data = await response.json();
  return Array.isArray(data?.data) ? data.data.map((model) => model.id).filter(Boolean).sort() : [];
}

export async function createChatCompletion(settings, messages, { signal } = {}) {
  const { endpoint, apiKey, model } = ensureConfig(settings);
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    signal,
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    let detail = '';
    try {
      const data = await response.json();
      detail = data?.error?.message ? `: ${data.error.message}` : '';
    } catch {}
    throw new Error(`Chat request failed (${response.status})${detail}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response content.';
}
