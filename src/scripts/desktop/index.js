import { initAppWindowControls } from './appWindowControls.js';
import { initChatApp } from './chat.js';
import { initDesktopChallenge } from './challenge.js';
import { initDesktopClock } from './clock.js';
import { initContextMenus } from './contextMenu.js';
import { initDisplayControls } from './displayControls.js';
import { initEasterEggs } from './easterEggs.js';
import { initExternalLinks } from './externalLinks.js';
import { initDesktopNotifications } from './notifications.js';
import { initSettingsControls, applyDesktopPrefs, syncSettingsControls } from './prefs.js';
import { restoreWindowState, setActiveRoute } from './router.js';
import { saveWindowState } from './windowState.js';
import { initWindowLinks } from './links.js';
import { initLauncher } from './launcher.js';
import { initShortcutHelper } from './shortcuts.js';
import { initTerminalApp } from './terminal.js';
import { initWindowManager } from './windowManager.js';

function initDesktop() {
  applyDesktopPrefs();
  setActiveRoute(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
    document.title,
    {
      replace: true,
    },
  );
  initDesktopClock();
  initWindowManager();
  initExternalLinks();
  initWindowLinks();
  initSettingsControls();
  initDisplayControls();
  initContextMenus();
  initDesktopNotifications();
  initEasterEggs();
  initDesktopChallenge();
  initLauncher();
  initShortcutHelper();
  initChatApp();
  initTerminalApp();
  initAppWindowControls();
  syncSettingsControls();
}

document.addEventListener('DOMContentLoaded', () => {
  initDesktop();
  restoreWindowState();
});

document.addEventListener('astro:page-load', initDesktop);
window.addEventListener('desktop:window-state-change', saveWindowState);
window.addEventListener('desktop:prefs-change', initWindowManager);
window.addEventListener('desktop:content-change', initChatApp);
window.addEventListener('desktop:content-change', initTerminalApp);
window.addEventListener('desktop:content-change', () => initExternalLinks());
window.addEventListener('desktop:content-change', initAppWindowControls);
