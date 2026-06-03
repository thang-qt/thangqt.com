import { openInternalHref } from './router.js';

function getApps() {
  return Array.isArray(window.__DESKTOP_APPS) ? window.__DESKTOP_APPS.filter((app) => app.nav !== false) : [];
}

function isTypingTarget(target) {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function normalize(value) {
  return value.toLowerCase().trim();
}

function appMatches(app, query) {
  if (!query) return true;
  const haystack = normalize(`${app.label} ${app.href} ${app.id}`);
  return haystack.includes(query);
}

function escapeAttr(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openApp(app) {
  if (!app?.href) return;
  closeLauncher();
  openInternalHref(app.href, app.label, { replaceExisting: true });
}

function getLauncher() {
  return document.querySelector('[data-launcher]');
}

function getInput() {
  return document.querySelector('[data-launcher-input]');
}

function getList() {
  return document.querySelector('[data-launcher-list]');
}

function setSelected(index) {
  const launcher = getLauncher();
  const rows = [...document.querySelectorAll('[data-launcher-item]')];
  if (!launcher || rows.length === 0) return;

  const next = Math.max(0, Math.min(index, rows.length - 1));
  launcher.dataset.launcherSelected = String(next);
  rows.forEach((row, rowIndex) => {
    row.classList.toggle('is-selected', rowIndex === next);
    row.setAttribute('aria-selected', rowIndex === next ? 'true' : 'false');
  });
  rows[next]?.scrollIntoView({ block: 'nearest' });
}

function getSelectedIndex() {
  const launcher = getLauncher();
  return Number.parseInt(launcher?.dataset.launcherSelected || '0', 10) || 0;
}

function renderLauncher() {
  const launcher = getLauncher();
  const input = getInput();
  const list = getList();
  if (!launcher || !input || !list) return;

  const query = normalize(input.value || '');
  const apps = getApps().filter((app) => appMatches(app, query));

  list.innerHTML = apps.length > 0
    ? apps.map((app, index) => `
        <button type="button" class="desktop-launcher__item" data-launcher-item data-app-id="${escapeAttr(app.id)}" data-href="${escapeAttr(app.href)}" data-label="${escapeAttr(app.label)}" role="option" aria-selected="${index === 0 ? 'true' : 'false'}">
          <span class="desktop-launcher__icon" aria-hidden="true">${app.icon || '□'}</span>
          <span class="desktop-launcher__text">
            <strong>${app.label}</strong>
          </span>
        </button>
      `).join('')
    : '<p class="desktop-launcher__empty">No matching apps</p>';

  list.querySelectorAll('[data-launcher-item]').forEach((item) => {
    const iconSlot = item.querySelector('.desktop-launcher__icon');
    const template = document.querySelector(`[data-app-icon-template="${item.dataset.appId}"]`);
    if (iconSlot && template instanceof HTMLTemplateElement) {
      iconSlot.replaceChildren(template.content.cloneNode(true));
    }
  });

  setSelected(0);
}

export function openLauncher() {
  const launcher = getLauncher();
  const input = getInput();
  if (!launcher || !input) return;

  launcher.hidden = false;
  document.documentElement.classList.add('has-launcher-open');
  input.value = '';
  renderLauncher();
  requestAnimationFrame(() => input.focus());
}

export function closeLauncher() {
  const launcher = getLauncher();
  if (!launcher) return;

  launcher.hidden = true;
  document.documentElement.classList.remove('has-launcher-open');
}

function toggleLauncher() {
  const launcher = getLauncher();
  if (!launcher) return;
  if (launcher.hidden) openLauncher();
  else closeLauncher();
}

function initLauncherEvents() {
  if (window.__desktopLauncherReady) return;
  window.__desktopLauncherReady = true;

  document.addEventListener('click', (event) => {
    const openButton = event.target?.closest?.('[data-launcher-open]');
    if (openButton) {
      event.preventDefault();
      toggleLauncher();
      return;
    }

    const backdrop = event.target?.closest?.('[data-launcher-backdrop]');
    if (backdrop) {
      closeLauncher();
      return;
    }

    const item = event.target?.closest?.('[data-launcher-item]');
    if (item instanceof HTMLElement) {
      openApp({ href: item.dataset.href, label: item.dataset.label });
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target?.matches?.('[data-launcher-input]')) renderLauncher();
  });

  document.addEventListener('keydown', (event) => {
    const launcher = getLauncher();
    const isLauncherOpen = launcher && !launcher.hidden;
    const key = event.key.toLowerCase();

    if (event.altKey && key === 'space') {
      event.preventDefault();
      toggleLauncher();
      return;
    }

    if (event.altKey && /^[1-9]$/.test(event.key) && !isTypingTarget(event.target)) {
      const app = getApps()[Number(event.key) - 1];
      if (app) {
        event.preventDefault();
        openApp(app);
      }
      return;
    }

    if (!isLauncherOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeLauncher();
      return;
    }

    const rows = [...document.querySelectorAll('[data-launcher-item]')];
    if (rows.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((getSelectedIndex() + 1) % rows.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((getSelectedIndex() - 1 + rows.length) % rows.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const item = rows[getSelectedIndex()];
      if (item instanceof HTMLElement) openApp({ href: item.dataset.href, label: item.dataset.label });
    }
  });
}

export function initLauncher() {
  renderLauncher();
  initLauncherEvents();
}
