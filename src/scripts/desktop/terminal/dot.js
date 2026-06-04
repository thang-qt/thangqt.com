import { createChatCompletion } from '../llm/client.js';
import { buildSystemPrompt } from '../llm/context.js';
import { readStoredSettings } from '../llm/settings.js';
import { rememberDotTurn } from './state.js';

export function getDotConfigStatus() {
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

export async function askDot(root, command) {
  const settings = readStoredSettings();
  if (!settings.endpoint || !settings.apiKey) {
    return [
      'Dot pats its pockets and finds no API key.',
      'Open Chat → gear, configure an OpenAI-compatible endpoint/key, then try again.',
    ];
  }

  const state = root.__terminalState;
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
    `Current fake directory: ${state?.cwd || '~'}`,
  ].join('\n\n');

  const reply = await createChatCompletion(settings, [
    { role: 'system', content: context },
    ...(state?.messages || []),
    { role: 'user', content: `Terminal command: ${command}` },
  ]);

  rememberDotTurn(root, command, reply);
  return reply.split('\n');
}
