import { syncSettingsControls } from './prefs.js';

export function afterWindowContentChange() {
  syncSettingsControls();
  window.dispatchEvent(new CustomEvent('desktop:content-change'));
}
