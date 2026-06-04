import { addGlobalListenerOnce } from './events.js';

const appWindowControls = {
  chat: [
    {
      id: 'clear-chat',
      label: 'Clear chat',
      iconTemplate: 'chat-clear',
      event: 'desktop:chat-clear',
    },
  ],
};

function getWindowApp(win) {
  return win?.dataset?.windowBaseApp || win?.dataset?.windowApp?.split('-')?.[0] || '';
}

function getIconTemplate(id) {
  return document.querySelector(`[data-window-control-icon-template="${id}"]`);
}

function renderControl(control) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.appWindowControl = control.id;
  button.dataset.appWindowControlEvent = control.event;
  button.setAttribute('aria-label', control.label);
  button.title = control.label;

  const template = getIconTemplate(control.iconTemplate);
  if (template instanceof HTMLTemplateElement) {
    button.appendChild(template.content.cloneNode(true));
  } else {
    button.textContent = '·';
  }

  return button;
}

export function syncAppWindowControls() {
  document.querySelectorAll('.desktop-window').forEach((win) => {
    const controlsEl = win.querySelector('.desktop-window__controls');
    if (!controlsEl) return;

    controlsEl.querySelectorAll('[data-app-window-control]').forEach((button) => button.remove());

    const app = getWindowApp(win);
    const controls = appWindowControls[app] || [];
    const before = controlsEl.querySelector('[data-window-action="minimize"]') || controlsEl.firstChild;

    controls.forEach((control) => {
      controlsEl.insertBefore(renderControl(control), before);
    });
  });
}

function initAppWindowControlEvents() {
  addGlobalListenerOnce('desktop-app-window-controls:click', document, 'click', (event) => {
    const button = event.target?.closest?.('[data-app-window-control]');
    if (!(button instanceof HTMLButtonElement)) return;

    const win = button.closest('.desktop-window');
    const eventName = button.dataset.appWindowControlEvent;
    if (!eventName) return;

    event.preventDefault();
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent(eventName, { detail: { window: win, button } }));
  });
}

export function initAppWindowControls() {
  syncAppWindowControls();
  initAppWindowControlEvents();
}
