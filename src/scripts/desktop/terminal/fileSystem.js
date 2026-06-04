export const openCommands = {
  projects: { href: '/projects', title: 'Projects' },
  writing: { href: '/writing', title: 'Writing' },
  links: { href: '/links', title: 'Links' },
  settings: { href: '/settings', title: 'Settings' },
  chat: { href: '/chat', title: 'Chat' },
};

const files = {
  '~': {
    type: 'dir',
    children: {
      'README.txt': {
        type: 'file',
        content: [
          'Welcome to the home directory.',
          'Most useful things are probably somewhere else.',
          'Run `upgrade` when the shell starts feeling too small.',
        ],
      },
      'dot.txt': {
        type: 'file',
        content: [
          'Dot is the small AI mind that powers the chat app.',
          'Run `connect` to configure Dot, then `upgrade` to let it take over unknown terminal commands.',
        ],
      },
      'resume.txt': {
        type: 'file',
        content: [
          'Are you a recruiter?',
          'If not, please stop reading and go discover something else.',
          '...',
          '...',
          'STOP. Why are you still reading?',
          '...',
          'Okay, so I guess you are a recruiter then.',
          'Hold on. I am thinking of something professional to say.',
          '...',
          'I am handsome, intelligent, extremely mature, and possibly the most sane person on earth.',
          'I also bring strong synergy, scalable vibes, and a proven ability to name files poorly.',
          'Okay, I am kidding.',
          'I am just another guy who loves tinkering, building small things, and making computers slightly more personal.',
          '*awkward stare*',
          'But seriously:',
          'HIRE ME',
        ],
      },
      projects: {
        type: 'dir',
        children: {
          'README.md': {
            type: 'file',
            content: [
              'A drawer full of prototypes, good intentions, and one CSS decision I refuse to discuss.',
              'Some projects are finished. Some are "finished" in the software sense.',
              'Run `open projects` to browse them.',
            ],
          },
          'definitely-final-v2.txt': {
            type: 'file',
            content: [
              'final_v2_revised_REAL_final_use_this_one.txt was moved to another universe.',
            ],
          },
        },
      },
      writing: {
        type: 'dir',
        children: {
          'README.md': {
            type: 'file',
            content: [
              'Drafts, notes, essays, and several titles that arrived before the actual thoughts.',
              'The cursor blinked here for a very long time.',
              'Run `open writing` to read posts.',
            ],
          },
          'draft-that-will-totally-be-finished.txt': {
            type: 'file',
            content: ['Status: emotionally complete, textually absent.'],
          },
        },
      },
      downloads: {
        type: 'dir',
        children: {
          'linux-iso-actually-final.iso': {
            type: 'file',
            content: ['0 bytes', 'Downloaded successfully, emotionally speaking.'],
          },
          'todo-from-2021.txt': {
            type: 'file',
            content: ['- learn vim', '- become a morning person', '- rename this file'],
          },
          'wallpaper-37.png': {
            type: 'file',
            content: ['This is not an image. This is a lifestyle choice with a .png extension.'],
          },
        },
      },
      notes: {
        type: 'dir',
        children: {
          'ideas.txt': {
            type: 'file',
            content: [
              'app idea: calendar that gently judges you',
              'site idea: terminal that should probably stop lying',
            ],
          },
          'meeting-notes.txt': {
            type: 'file',
            content: [
              'Attendees: me',
              'Decision: postpone decision',
              'Action item: create better action item',
            ],
          },
          'names.txt': {
            type: 'file',
            content: ['Dot', 'ThangOS', 'Untitled Final Name', 'Naming things remains impossible.'],
          },
        },
      },
      suspicious: {
        type: 'dir',
        children: {
          'passwords.txt': {
            type: 'file',
            content: ['hunter2', 'just kidding. please use a password manager.'],
          },
          'taxes-2025.txt': {
            type: 'file',
            content: ['This folder has been staring at me since April.'],
          },
          'do-not-cat.txt': {
            type: 'file',
            content: ['You had one job.', 'The file is disappointed but not surprised.'],
          },
          '.totally-not-a-secret': {
            type: 'file',
            content: [
              'The secret is that there is no secret.',
              'This has not stopped the folder from acting mysterious.',
            ],
          },
        },
      },
    },
  },
};

export function splitArgs(command) {
  return command.trim().split(/\s+/).filter(Boolean);
}

export function normalizePath(cwd, target = '') {
  const raw = target || cwd;
  const parts = raw.startsWith('~') ? [] : cwd.replace(/^~\/?/, '').split('/').filter(Boolean);

  raw
    .replace(/^~\/?/, '')
    .split('/')
    .filter(Boolean)
    .forEach((part) => {
      if (part === '.') return;
      if (part === '..') parts.pop();
      else parts.push(part);
    });

  return parts.length > 0 ? `~/${parts.join('/')}` : '~';
}

export function getNode(path) {
  const parts = path.replace(/^~\/?/, '').split('/').filter(Boolean);
  let node = files['~'];
  for (const part of parts) {
    if (node?.type !== 'dir') return null;
    node = node.children?.[part];
  }
  return node || null;
}

export function formatList(node) {
  return Object.entries(node.children || {})
    .map(([name, child]) => (child.type === 'dir' ? `${name}/` : name))
    .sort((a, b) => a.localeCompare(b));
}

export function getHelpLines(upgraded = false) {
  return [
    'Available commands:',
    '  help              Show this help',
    '  pwd               Print current directory',
    '  ls [dir]          List files',
    '  cd [dir]          Change directory',
    '  cat <file>        Read a file',
    '  open <app>        Open projects, writing, links, settings, or chat',
    '  clear             Clear the terminal',
    '  connect           Configure Dot provider credentials',
    '  config            Show Dot connection status',
    '  upgrade           Invite Dot to handle unknown commands',
    upgraded ? '' : 'Tip: this shell is intentionally tiny. `upgrade` makes it weirder.',
  ].filter(Boolean);
}
