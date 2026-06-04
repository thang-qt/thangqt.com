export function setActiveRoute(href, title, { replace = false } = {}) {
  const nextUrl = new URL(href, window.location.origin);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

  if (replace) window.history.replaceState({ href: nextPath, title }, '', nextPath);
  else if (nextPath !== currentUrl)
    window.history.pushState({ href: nextPath, title }, '', nextPath);

  if (title) document.title = title.includes('ThangQT') ? title : `${title} - ThangQT`;

  document.querySelectorAll('.desktop-menu__nav a').forEach((navLink) => {
    const navPath = new URL(navLink.href).pathname;
    const isActive =
      navPath === '/'
        ? nextUrl.pathname === '/'
        : nextUrl.pathname === navPath || nextUrl.pathname.startsWith(`${navPath}/`);
    if (isActive) navLink.setAttribute('aria-current', 'page');
    else navLink.removeAttribute('aria-current');
  });
}
