export const desktopTheme = {
  accent: '#13c3a3',
  accentSoft: '#9de5bd',
  background: '#87cf9d',
  surface: '#f3fff0',
  chrome: '#dff3d8',
  ink: '#050505',
  border: '#050505',
  padding: '0.75rem',
  windowRadius: '7px',
  shadow: '3px 3px 0 rgba(0, 0, 0, 0.16)',
  patternSize: '32px',
};

export const desktopApps = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: '⌂',
    nav: true,
    window: { minWidth: 320, minHeight: 240, width: 'min(64rem, calc(100vw - 5rem))', height: 'min(46rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'writing',
    label: 'Writing',
    href: '/writing',
    icon: '✎',
    nav: true,
    detailWindows: true,
    window: { minWidth: 340, minHeight: 260, width: 'min(58rem, calc(100vw - 5rem))', height: 'min(48rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: '▦',
    nav: true,
    detailWindows: true,
    window: { minWidth: 360, minHeight: 260, width: 'min(66rem, calc(100vw - 5rem))', height: 'min(49rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'links',
    label: 'Links',
    href: '/links',
    icon: '↗',
    nav: true,
    detailWindows: true,
    window: { minWidth: 320, minHeight: 240, width: 'min(54rem, calc(100vw - 5rem))', height: 'min(44rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    icon: '☻',
    nav: true,
    window: { minWidth: 320, minHeight: 220, width: 'min(50rem, calc(100vw - 5rem))', height: 'min(38rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'resume',
    label: 'Resume',
    href: '/resume',
    icon: '□',
    nav: true,
    window: { minWidth: 380, minHeight: 300, width: 'min(68rem, calc(100vw - 5rem))', height: 'min(50rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙',
    nav: true,
    window: { minWidth: 340, minHeight: 260, width: 'min(46rem, calc(100vw - 5rem))', height: 'min(42rem, calc(100dvh - 8rem))' },
  },
  {
    id: 'design',
    label: 'Design',
    href: '/design',
    icon: '◫',
    nav: true,
    window: { minWidth: 360, minHeight: 280, width: 'min(72rem, calc(100vw - 5rem))', height: 'min(52rem, calc(100dvh - 8rem))' },
  },
];

export const desktopNavItems = desktopApps.filter((app) => app.nav);

export function getDesktopAppForPath(pathname: string) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return [...desktopApps]
    .sort((a, b) => b.href.length - a.href.length)
    .find((app) => {
      if (app.href === '/') return normalized === '/';
      return normalized === app.href || normalized.startsWith(`${app.href}/`);
    }) ?? desktopApps[0];
}

export function getDesktopAppKeyForPath(pathname: string) {
  const app = getDesktopAppForPath(pathname);
  const parts = pathname.split('/').filter(Boolean);
  if (app.detailWindows && parts[1] && parts[1] !== 'page') return `${app.id}-${parts[1]}`;
  return app.id;
}

export const desktopProfile = {
  name: 'ThangQT',
  handle: 'thang-qt',
  role: 'Computer science student at UET-VNU',
  location: 'Vietnam',
  tagline: 'Open-source developer, Linux enjoyer, and builder of small tools.',
  status: 'Personal site / desktop edition',
  links: [
    { label: 'GitHub', href: 'https://github.com/thang-qt' },
    { label: 'Email', href: 'mailto:thang@thangqt.com' },
  ],
};

export const desktopThemePacks = [
  {
    id: 'poolsuite',
    label: 'Poolsuite',
    note: 'Mint, leisure OS, pixel resort energy.',
  },
  {
    id: 'bloom',
    label: 'Bloom',
    note: 'Soft garden chrome with peach and leaf tones.',
  },
  {
    id: 'paper',
    label: 'Paper Desk',
    note: 'Warm writing room with ruled cards.',
  },
  {
    id: 'signal',
    label: 'Signal Lab',
    note: 'Blue dashboard chrome and radar grain.',
  },
];

export const desktopBackgroundPatterns = [
  {
    id: 'tiles',
    label: 'Pool Tiles',
    note: 'Isometric resort tiles.',
  },
  {
    id: 'grid',
    label: 'Desk Grid',
    note: 'Quiet graph paper field.',
  },
  {
    id: 'rings',
    label: 'Signal Rings',
    note: 'Soft radar marks.',
  },
  {
    id: 'noise',
    label: 'Static Wash',
    note: 'Fine retro monitor texture.',
  },
];
