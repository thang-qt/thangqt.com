/**
 * Theme toggle functionality
 * Handles light/dark mode switching with localStorage persistence
 */

export function initTheme() {
  const THEME_KEY = 'theme';
  const html = document.documentElement;
  
  // Get saved theme or default to light
  const getTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  };
  
  // Set theme
  const setTheme = (theme) => {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update toggle button aria-label
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    }
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };
  
  // Initialize theme on load
  setTheme(getTheme());
  
  // Add event listener to toggle button
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}
