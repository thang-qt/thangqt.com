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

function removeNotification(notification) {
  notification.classList.add('is-leaving');
  window.setTimeout(() => notification.remove(), 240);
}

function appendNotificationText(notification, { title, message }) {
  if (title) {
    const titleNode = document.createElement('strong');
    titleNode.textContent = title;
    notification.append(titleNode);
  }

  if (message) {
    const messageNode = document.createElement('span');
    messageNode.textContent = message;
    notification.append(messageNode);
  }
}

function appendNotificationActions(notification, actions = []) {
  const validActions = actions.filter((action) => action?.label);
  if (validActions.length === 0) return;

  const actionList = document.createElement('div');
  actionList.className = 'desktop-notification__actions';

  validActions.forEach((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      if (typeof action.onClick === 'function') action.onClick();
      if (action.event) {
        window.dispatchEvent(new CustomEvent(action.event, { detail: action.detail || {} }));
      }
      if (action.dismiss !== false) removeNotification(notification);
    });
    actionList.append(button);
  });

  notification.append(actionList);
}

export function showDesktopNotification({
  title,
  message,
  actions = [],
  duration = DEFAULT_NOTIFICATION_DURATION,
} = {}) {
  if (!title && !message) return null;

  const host = getNotificationHost();
  const notification = document.createElement('div');
  notification.className = 'desktop-notification';
  notification.dataset.desktopNotification = 'true';
  notification.setAttribute('role', 'status');

  appendNotificationText(notification, { title, message });
  appendNotificationActions(notification, actions);

  host.append(notification);

  if (duration !== Number.POSITIVE_INFINITY) {
    const leaveAfter = Math.max(0, duration - 260);
    window.setTimeout(() => notification.classList.add('is-leaving'), leaveAfter);
    window.setTimeout(() => notification.remove(), duration);
  }

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
