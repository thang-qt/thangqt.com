import { addGlobalListenerOnce } from './events.js';
import { saveWindowState } from './windowState.js';

export function initDisplayControls() {
  addGlobalListenerOnce('desktop-display-controls:click', document, 'click', (event) => {
    const button = event.target?.closest?.('[data-list-view]');
    if (!(button instanceof HTMLButtonElement)) return;
    const win = button.closest('.desktop-window');
    if (!(win instanceof HTMLElement)) return;

    win.dataset.listView = button.dataset.listView || 'list';
    win.querySelectorAll('[data-list-view]').forEach((item) => {
      item.toggleAttribute('aria-pressed', item === button);
    });
    saveWindowState();
  });
}
