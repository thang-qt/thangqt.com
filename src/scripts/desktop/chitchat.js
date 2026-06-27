function notify(title, message) {
  window.dispatchEvent(new CustomEvent('desktop:notify', { detail: { title, message } }));
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement('textarea');
  input.value = text;
  input.setAttribute('readonly', 'true');
  input.style.position = 'fixed';
  input.style.top = '-999px';
  document.body.append(input);
  input.select();
  document.execCommand('copy');
  input.remove();
}

function handleLike(button) {
  const isLiked = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!isLiked));
  button.classList.remove('is-popping');
  void button.offsetWidth;
  button.classList.add('is-popping');
}

async function handleShare(button) {
  const permalink = button.dataset.chitchatShare;
  if (!permalink) return;

  const url = new URL(permalink, window.location.origin).toString();

  try {
    await copyText(url);
    notify('Copied Chitchat link', 'Permanent link copied to clipboard.');
  } catch {
    notify('Could not copy link', url);
  }
}

function handleChitchatClick(event) {
  const likeButton = event.target.closest('[data-chitchat-like]');
  if (likeButton) {
    handleLike(likeButton);
    return;
  }

  const shareButton = event.target.closest('[data-chitchat-share]');
  if (shareButton) handleShare(shareButton);
}

export function initChitchatApp() {
  document.removeEventListener('click', handleChitchatClick);
  document.addEventListener('click', handleChitchatClick);
}
