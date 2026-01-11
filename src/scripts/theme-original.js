// Theme Toggle (replicated from segundofdez.com)
const THEME_PREF = 'theme-preference';

const onClick = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  setPreference();
};

const getColorPreference = () => {
  if (localStorage.getItem(THEME_PREF)) {
    return localStorage.getItem(THEME_PREF);
  } else {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
};

const setPreference = () => {
  localStorage.setItem(THEME_PREF, theme.value);
  reflectPreference();
};

const reflectPreference = () => {
  document.firstElementChild.setAttribute('data-theme', theme.value);

  const toggle = document.querySelector('#theme-toggle');
  if (toggle) {
    const value = theme.value;
    const label = toggle.querySelector('span');
    if (label) {
      label.textContent = value === 'dark' ? 'Dark' : 'Light';
    }
    toggle.setAttribute('aria-label', value);
    toggle.setAttribute('data-theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }
};

const theme = {
  value: getColorPreference(),
};

export function themeToggle() {
  reflectPreference();

  document.querySelector('#theme-toggle').addEventListener('click', onClick);

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({matches: isDark}) => {
      theme.value = isDark ? 'dark' : 'light';
      setPreference();
    });
}
