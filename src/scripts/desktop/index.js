import { initAppWindowControls } from './appWindowControls.js';
import { initChatApp } from './chat.js';
import { initDesktopClock } from './clock.js';
import { initContextMenus } from './contextMenu.js';
import { initDisplayControls } from './displayControls.js';
import { initSettingsControls, applyDesktopPrefs, syncSettingsControls } from './prefs.js';
import { restoreWindowState, setActiveRoute } from './router.js';
import { saveWindowState } from './windowState.js';
import { initWindowLinks } from './links.js';
import { initLauncher } from './launcher.js';
import { initShortcutHelper } from './shortcuts.js';
import { initWindowManager } from './windowManager.js';

function initDesktop() {
  applyDesktopPrefs();
  setActiveRoute(`${window.location.pathname}${window.location.search}${window.location.hash}`, document.title, {
    replace: true,
  });
  initDesktopClock();
  initWindowManager();
  initWindowLinks();
  initSettingsControls();
  initDisplayControls();
  initContextMenus();
  initLauncher();
  initShortcutHelper();
  initChatApp();
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
window.addEventListener('desktop:content-change', initAppWindowControls);
