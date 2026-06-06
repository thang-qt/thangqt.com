import { addGlobalListenerOnce } from './events.js';

const NOTIFICATION_EVENT = 'desktop:notify';
const DEFAULT_NOTIFICATION_DURATION = 3600;

function getNotificationHost() {
  let host = document.querySelector('[data-desktop-notifications]');
  if (host) return host;

  host = document.createElement('div');
  host.className = 'desktop-notifications';
  host.dataset.desktopNotifications = 'true';
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-label', 'Desktop notifications');
  document.body.append(host);
  return host;
}

export function showDesktopNotification({
  title,
  message,
  duration = DEFAULT_NOTIFICATION_DURATION,
} = {}) {
  if (!title && !message) return null;

  const host = getNotificationHost();
  const notification = document.createElement('div');
  notification.className = 'desktop-notification';
  notification.dataset.desktopNotification = 'true';
  notification.setAttribute('role', 'status');

  notification.innerHTML = `
    ${title ? `<strong>${title}</strong>` : ''}
    ${message ? `<span>${message}</span>` : ''}
  `;

  host.append(notification);

  const leave = () => notification.classList.add('is-leaving');
  const remove = () => notification.remove();
  const leaveAfter = Math.max(0, duration - 260);

  window.setTimeout(leave, leaveAfter);
  window.setTimeout(remove, duration);

  return notification;
}

function handleNotificationEvent(event) {
  showDesktopNotification(event.detail || {});
}

export function initDesktopNotifications() {
  getNotificationHost();
  addGlobalListenerOnce(
    'desktop-notifications:event',
    window,
    NOTIFICATION_EVENT,
    handleNotificationEvent,
  );
}
