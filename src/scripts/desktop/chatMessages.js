export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildMessage(role, text, { html = null } = {}) {
  const label = role === 'user' ? 'YOU' : 'AI';
  return `
    <article class="llm-message llm-message--${role}" data-llm-message-role="${role}" data-llm-message-content="${escapeHtml(text)}" aria-label="${label}">
      ${html || `<p>${escapeHtml(text)}</p>`}
    </article>
  `;
}

export function getConversation(messagesEl) {
  return [...messagesEl.querySelectorAll('[data-llm-message-role]')].map((message) => ({
    role: message.dataset.llmMessageRole === 'user' ? 'user' : 'assistant',
    content: message.dataset.llmMessageContent || message.textContent.trim(),
  })).filter((message) => message.content);
}

export function scrollToBottom(messages) {
  messages.scrollTop = messages.scrollHeight;
}

export function getConfigurationPrompt() {
  return 'Dot is awake — yep, that’s my name — but sadly has no brain wired in yet. Open the gear menu and add an OpenAI-compatible endpoint, API key, and model so I can actually think instead of just looking cute.';
}
