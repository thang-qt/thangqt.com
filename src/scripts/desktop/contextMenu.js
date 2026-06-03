import { getInternalHref, getLinkTitle, openLink } from './links.js';
import { openHrefInWindow, openInternalHref } from './router.js';
import { bringWindowForward } from './windowManager.js';

function getMenu() {
  let menu = document.querySelector('.desktop-context-menu');
  if (menu) return menu;

  menu = document.createElement('div');
  menu.className = 'desktop-context-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;
  document.body.appendChild(menu);
  return menu;
}

function closeMenu() {
  const menu = document.querySelector('.desktop-context-menu');
  if (menu) menu.hidden = true;
}

function menuButton(label, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('role', 'menuitem');
  button.addEventListener('click', () => {
    closeMenu();
    action();
  });
  return button;
}

function showMenu(event, items) {
  const menu = getMenu();
  menu.replaceChildren(...items);
  menu.hidden = false;

  const menuRect = menu.getBoundingClientRect();
  const x = Math.min(event.clientX, window.innerWidth - menuRect.width - 8);
  const y = Math.min(event.clientY, window.innerHeight - menuRect.height - 8);
  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;
}

function desktopItems() {
  return [
    menuButton('Open Settings', () => openInternalHref('/settings', 'Settings')),
    menuButton('Open Resume', () => openInternalHref('/resume', 'Resume')),
    menuButton('Open Projects', () => openInternalHref('/projects', 'Projects')),
  ];
}

function windowItems(win) {
  return [
    menuButton('Bring To Front', () => bringWindowForward(win)),
    menuButton('Minimize', () => {
      win.classList.toggle('is-minimized');
      window.dispatchEvent(new CustomEvent('desktop:window-state-change'));
    }),
    menuButton('Maximize / Restore', () => win.querySelector('[data-window-action="maximize"]')?.click()),
    menuButton('Close', () => win.querySelector('[data-window-action="close"]')?.click()),
  ];
}

function linkItems(link, win) {
  const href = getInternalHref(link);
  const title = getLinkTitle(link);
  const items = [
    menuButton('Open In This Window', () => {
      if (href && win instanceof HTMLElement) openHrefInWindow(win, href, title);
      else openLink(link, 'auto');
    }),
    menuButton('Open In New Window', () => openLink(link, 'new-window')),
  ];

  if (href) {
    items.push(menuButton('Copy Internal URL', () => navigator.clipboard?.writeText(href)));
  } else {
    items.push(menuButton('Open External Tab', () => window.open(link.href, '_blank', 'noopener,noreferrer')));
    items.push(menuButton('Copy Link', () => navigator.clipboard?.writeText(link.href)));
  }

  if (href) items[0].textContent = `Open ${title}`;
  return items;
}

export function initContextMenus() {
  if (window.__desktopContextMenuReady) return;
  window.__desktopContextMenuReady = true;

  document.addEventListener('contextmenu', (event) => {
    const link = event.target?.closest?.('a');
    const win = event.target?.closest?.('.desktop-window');
    const isDesktop = event.target?.closest?.('.desktop-stage, .desktop-bg');
    if (!link && !win && !isDesktop) return;

    event.preventDefault();
    if (link instanceof HTMLAnchorElement) showMenu(event, linkItems(link, win));
    else if (win instanceof HTMLElement) showMenu(event, windowItems(win));
    else showMenu(event, desktopItems());
  });

  document.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}
