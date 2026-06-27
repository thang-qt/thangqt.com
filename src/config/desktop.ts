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

export const desktopAppIcons = {
  home: 'ph:house',
  writing: 'ph:pencil-simple',
  projects: 'ph:cube',
  links: 'ph:link',
  about: 'ph:info',
  resume: 'ph:file-text',
  settings: 'ph:gear',
  chitchat: 'ph:users-three',
  chat: 'ph:chat-circle',
  terminal: 'ph:terminal',
};

export const desktopApps = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: '⌂',
    iconName: desktopAppIcons.home,
    nav: true,
    pinned: true,
    window: {
      minWidth: 320,
      minHeight: 240,
      width: 'min(64rem, calc(100vw - 5rem))',
      height: 'min(46rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'writing',
    label: 'Writing',
    href: '/writing',
    icon: '✎',
    iconName: desktopAppIcons.writing,
    nav: true,
    pinned: true,
    detailWindows: true,
    window: {
      minWidth: 340,
      minHeight: 260,
      width: 'min(58rem, calc(100vw - 5rem))',
      height: 'min(48rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: '◈',
    iconName: desktopAppIcons.projects,
    nav: true,
    pinned: true,
    detailWindows: true,
    window: {
      minWidth: 360,
      minHeight: 260,
      width: 'min(66rem, calc(100vw - 5rem))',
      height: 'min(49rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'links',
    label: 'Links',
    href: '/links',
    icon: '↗',
    iconName: desktopAppIcons.links,
    nav: true,
    pinned: true,
    detailWindows: true,
    window: {
      minWidth: 320,
      minHeight: 240,
      width: 'min(54rem, calc(100vw - 5rem))',
      height: 'min(44rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'chitchat',
    label: 'Chitchat',
    href: '/chitchat',
    icon: '◍',
    iconName: desktopAppIcons.chitchat,
    nav: true,
    pinned: true,
    window: {
      minWidth: 340,
      minHeight: 320,
      width: 'min(46rem, calc(100vw - 5rem))',
      height: 'min(50rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    icon: 'ⓘ',
    iconName: desktopAppIcons.about,
    nav: true,
    pinned: false,
    window: {
      minWidth: 320,
      minHeight: 220,
      width: 'min(50rem, calc(100vw - 5rem))',
      height: 'min(38rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'resume',
    label: 'Resume',
    href: '/resume',
    icon: '□',
    iconName: desktopAppIcons.resume,
    nav: true,
    pinned: false,
    window: {
      minWidth: 380,
      minHeight: 300,
      width: 'min(68rem, calc(100vw - 5rem))',
      height: 'min(50rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙',
    iconName: desktopAppIcons.settings,
    nav: true,
    pinned: false,
    window: {
      minWidth: 340,
      minHeight: 260,
      width: 'min(46rem, calc(100vw - 5rem))',
      height: 'min(42rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'chat',
    label: 'Chat',
    href: '/chat',
    icon: '◌',
    iconName: desktopAppIcons.chat,
    nav: true,
    pinned: false,
    window: {
      minWidth: 360,
      minHeight: 320,
      width: 'min(48rem, calc(100vw - 5rem))',
      height: 'min(44rem, calc(100dvh - 8rem))',
    },
  },
  {
    id: 'terminal',
    label: 'Terminal',
    href: '/terminal',
    icon: '▣',
    iconName: desktopAppIcons.terminal,
    nav: true,
    pinned: false,
    window: {
      minWidth: 380,
      minHeight: 280,
      width: 'min(46rem, calc(100vw - 5rem))',
      height: 'min(34rem, calc(100dvh - 8rem))',
    },
  },
];

export const desktopNavItems = desktopApps.filter((app) => app.nav);
export const desktopPinnedItems = desktopApps.filter((app) => app.pinned);

export function getDesktopAppForPath(pathname: string) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  return (
    [...desktopApps]
      .sort((a, b) => b.href.length - a.href.length)
      .find((app) => {
        if (app.href === '/') return normalized === '/';
        return normalized === app.href || normalized.startsWith(`${app.href}/`);
      }) ?? desktopApps[0]
  );
}

export function getDesktopAppKeyForPath(pathname: string) {
  const app = getDesktopAppForPath(pathname);
  const parts = pathname.split('/').filter(Boolean);
  if (app.detailWindows && parts[1] && parts[1] !== 'page') return `${app.id}-${parts[1]}`;
  return app.id;
}

export const desktopProfile = {
  name: 'Tô Quang Thắng',
  handle: 'thangqt',
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
    colors: ['#87cf9d', '#e7f8df', '#e1f4d8', '#13c3a3', '#9de5bd'],
  },
  {
    id: 'bloom',
    label: 'Bloom',
    note: 'Soft garden chrome with peach and leaf tones.',
    colors: ['#9fd6a3', '#f2f2cd', '#f7dca5', '#d66f57', '#ffc0a8'],
  },
  {
    id: 'paper',
    label: 'Paper Desk',
    note: 'Warm writing room with ruled cards.',
    colors: ['#d6bf8d', '#efe2bd', '#ecd8a5', '#a35d22', '#f1c981'],
  },
  {
    id: 'signal',
    label: 'Signal Lab',
    note: 'Blue dashboard chrome and radar grain.',
    colors: ['#7db7d9', '#dceef7', '#c7e3f2', '#1d7dff', '#9dd7ff'],
  },
];

export const desktopBackgroundPatterns = [
  {
    id: 'grid',
    label: 'Desk Grid',
    note: 'Quiet graph paper field.',
  },
  {
    id: 'noise',
    label: 'Static Wash',
    note: 'Fine retro monitor texture.',
  },
  {
    id: 'weave',
    label: 'Paper Weave',
    note: 'Diagonal linen crosshatch.',
  },
  {
    id: 'dots',
    label: 'Dot Field',
    note: 'Faint halftone dot grid.',
  },
  {
    id: 'circuit',
    label: 'Circuit Lines',
    note: 'Angled PCB trace pattern.',
  },
  {
    id: 'topography',
    label: 'Contour',
    note: 'Topographic elevation curves.',
  },
];
