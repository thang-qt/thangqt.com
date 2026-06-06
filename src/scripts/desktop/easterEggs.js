import { addGlobalListenerOnce } from './events.js';
import { showDesktopNotification } from './notifications.js';

const CAT_INCIDENT_EVENT = 'desktop:easter-egg';
const CAT_INCIDENT_ID = 'do-not-cat';
const CAT_INCIDENT_DURATION = 5200;

function dismissExistingIncident() {
  document.querySelectorAll('[data-cat-incident]').forEach((node) => node.remove());
}

function createCatIncident() {
  dismissExistingIncident();
  showDesktopNotification({
    title: 'nyan-containment.service failed',
    message: 'Unauthorized cat rendered to desktop.',
    duration: CAT_INCIDENT_DURATION,
  });

  const overlay = document.createElement('div');
  overlay.className = 'desktop-cat-incident';
  overlay.dataset.catIncident = 'true';
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div class="desktop-cat-incident__stage">
      <img
        class="desktop-cat-incident__nyan"
        src="/nyancat.svg"
        alt=""
        decoding="async"
      />
    </div>
  `;

  document.body.append(overlay);

  window.setTimeout(
    () => {
      overlay.classList.add('is-leaving');
    },
    Math.max(0, CAT_INCIDENT_DURATION - 500),
  );

  window.setTimeout(() => {
    overlay.remove();
  }, CAT_INCIDENT_DURATION);
}

function handleEasterEgg(event) {
  if (event.detail?.id !== CAT_INCIDENT_ID) return;
  createCatIncident();
}

export function initEasterEggs() {
  addGlobalListenerOnce(
    'desktop-easter-eggs:cat-incident',
    window,
    CAT_INCIDENT_EVENT,
    handleEasterEgg,
  );
}
