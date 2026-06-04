const fallbackApps = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    window: {
      minWidth: 320,
      minHeight: 240,
      width: 'min(64rem, calc(100vw - 5rem))',
      height: 'min(46rem, calc(100dvh - 8rem))',
    },
  },
];

function getApps() {
  return Array.isArray(window.__DESKTOP_APPS) && window.__DESKTOP_APPS.length > 0
    ? window.__DESKTOP_APPS
    : fallbackApps;
}

export function getAppForHref(href) {
  const url = new URL(href, window.location.origin);
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');

  return (
    [...getApps()]
      .sort((a, b) => b.href.length - a.href.length)
      .find((app) => {
        if (app.href === '/') return pathname === '/';
        return pathname === app.href || pathname.startsWith(`${app.href}/`);
      }) || getApps()[0]
  );
}

export function getAppKeyForHref(href) {
  const app = getAppForHref(href);
  const parts = new URL(href, window.location.origin).pathname.split('/').filter(Boolean);
  if (app.detailWindows && parts[1] && parts[1] !== 'page') return `${app.id}-${parts[1]}`;
  return app.id;
}

export function getWindowSpecForHref(href) {
  const app = getAppForHref(href);
  return {
    app,
    window: {
      minWidth: 300,
      minHeight: 220,
      width: 'min(62rem, calc(100vw - 4rem))',
      height: 'min(48rem, calc(100dvh - 7rem))',
      ...app.window,
    },
  };
}
