export function initDesktopClock() {
  const dateEl = document.querySelector('[data-desktop-date]');
  const clockEl = document.querySelector('[data-desktop-clock]');
  if (!dateEl || !clockEl) return;

  const update = () => {
    const now = new Date();
    dateEl.textContent = now
      .toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
      .toUpperCase();
    clockEl.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  update();
  clearInterval(window.__desktopClockTimer);
  window.__desktopClockTimer = setInterval(update, 30000);
}
