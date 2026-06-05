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
      'disclaimer.txt': {
        type: 'file',
        content: [
          "Opinions here are not mine. They are Dot's.",
          'Or maybe they are for some of them.',
        ],
      },
      'watch-list.txt': {
        type: 'file',
        content: [
          'WATCH LIST',
          '',
          'Comfort shows I actually enjoyed:',
          '- Friends: really love Joey. Overall funny, warm, and dangerously easy to keep watching.',
          '- New Girl: Schmidt carries, obviously. Hated Nick Miller somewhere along the line,',
          '  but his growth near the end made the annoyance feel almost productive.',
          '  Jess started likeable, then slowly became the human version of too much sugar.',
          '- The Big Bang Theory: watched quite a while ago, so memory is fuzzy.',
          '  Not much to say except: nerdy Sheldon was the main export.',
          '- Outlander: time travel, romance, trauma, repeat; very efficient scheduling.',
          '- Suits: 1% law, 99% aura farming.',
          '- Peaky Blinders: watched for the plot, stayed for the coats.',
          '',
          'Complicated:',
          '- Dexter: enjoyed it, then dropped around S5/S6 after Rita was killed. The moon was there. My trust was not.',
          '  Did not like the direction after that.',
          '',
          'Dropped after a few episodes:',
          '- The Office: the humor did not quite click; mostly felt bored.',
          '- Brooklyn Nine-Nine: probably good, just did not click in time',
        ],
      },
      'diary.txt': {
        type: 'file',
        content: [
          'Dear diary,',
          'Today I opened the terminal, stared blankly at hx for like half an hour,',
          'fired up the dev server, and poked around.',
          'Huh. This is totally fun.',
          'Let us just take a quick break.',
          '',
          'Several hours later:',
          'Okay, so let us continue.',
          'Today subject is Go generics.',
          'Okay, see, that is gonna be totally generic and boring.',
          'Let us just stop procrastinating and focus on prep for the exam.',
          '',
          'Last famous words.',
          'I did not.',
        ],
      },
      'gym-tracker.txt': {
        type: 'file',
        content: [
          'GYM TRACKER',
          '',
          'Started:',
          'Alright, just do it to be active.',
          'Sitting at the computer all day got me. That is it.',
          'I do not need to be big or anything...',
          '',
          'x time later:',
          'Wow. Damn. I want those biceps.',
          'Damn, how is he curling that?',
          '',
          'y time later:',
          'Man, I wanna be lean.',
          'Or maybe not. Be happy and eat this.',
          'Nobody is gonna see this belly anyway.',
          '',
          'z time later:',
          'Okay so I genuinely do not know if I am bulking or cutting.',
          'Depends on the time and wallet.',
          '',
          'Also: sauna and shower after the gym is like 50% of the attraction.',
          'Got me walking back feeling heavenly, like the subscription finally paid off.',
        ],
      },
      'swimming-lessons.txt': {
        type: 'file',
        content: [
          'SWIMMING LESSONS',
          '',
          'My father made me learn to swim in a river.',
          'Okay so I totally did not drink the river water. That would be gross.',
          '',
          'Also, who just casually drops into a river and knows how to swim?',
          'Propaganda detected.',
          '',
          'Okay okay, now I get it. It gets me floating now.',
          'Wait, why do my legs keep sinking while I am grabbing for air lol.',
          '',
          'Just wait. I am gonna do it someday.',
          'Abs and swimming. Totally not an intentional combo.',
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
          'project-lifetime.txt': {
            type: 'file',
            content: [
              'Hey, I got this totally cool project idea.',
              'Hey, some Reddit guy already did it.',
              'Nah, mine is more innovative and gonna be making bank.',
              '',
              'A few nights and several months later:',
              'Okay cool, it is fucking working now.',
              'I am so brilliant.',
              'Just gonna deploy this.',
              '',
              'Okay, deployed. I am so happy.',
              'Okay, so just need to find users.',
              'Pff, marketing is for suckers.',
              'Mine is cool, just gonna put it on Google and users will find their way.',
              '',
              'Hey, I got this totally cool project idea.',
              'Hey, some Reddit guy already did it.',
              'Nah, mine is more innovative and gonna be making bank.',
              '',
              'Several months later:',
              'Okay, this still totally makes sense,',
              'but I do not feel like doing it anymore.',
              'Let us just work on that cool idea first.',
            ],
          },
        },
      },
      writing: {
        type: 'dir',
        children: {
          'essay-ideas.txt': {
            type: 'file',
            content: [
              '- why I find idolization off-putting',
              '- I was privacy enthusiastic. I am now privacy mindful. TLDR: convenience won a few rounds.',
              '- why every piece of software should have dotfiles',
              '- productivity apps exist so you can feel productive while looking for them',
            ],
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
          'receipts.txt': {
            type: 'file',
            content: [
              'coffee',
              'coffee',
              'domain name I definitely needed',
              'coffee',
              'small notebook for ideas I later typed into a different app',
            ],
          },
        },
      },
      notes: {
        type: 'dir',
        children: {
          'hackernews.txt': {
            type: 'file',
            content: [
              'Hacker News:',
              'Why does this site still look like it was typeset in the 19th century?',
              'Look at lobste.rs: simple, nicely made, and probably a better community too.',
              '',
              'HN feels like a place where someone can explain distributed systems,',
              'then immediately argue that rounded corners are moral decay.',
            ],
          },
          'music.txt': {
            type: 'file',
            content: [
              'I love love love music.',
              'Do not ask for my favorite song. That is a moving target with headphones.',
              'I have a favorite for a while, binge it until the song files for emotional damages,',
              'then move on to the next one.',
              '',
              'No correlation to other things btw. None. Totally healthy rotation policy.',
            ],
          },
          'religion.txt': {
            type: 'file',
            content: [
              'God-like creatures? Something beyond us? Maybe.',
              'Organized religion feels manmade to me, so I do not really follow any specific one.',
              '',
              'But when desperate, I still find myself praying to God or Buddha.',
              'People often do that when a situation is outside their control.',
              'Maybe faith is partly about having somewhere to place hope.',
            ],
          },
          'education-system.txt': {
            type: 'file',
            content: [
              'Grades are necessary, probably.',
              'But treating them as the ultimate factor is how you reject people for being bad at a spreadsheet.',
              '',
              'Not everyone wants to learn every subject there is.',
              'Sometimes the system is so inflexible it accidentally teaches creativity to leave the building.',
              '',
              'Report card: B+ in compliance, C- in letting people become themselves.',
            ],
          },
          'ideas.txt': {
            type: 'file',
            content: [
              'deep-focus daemon:',
              '- app integrated very deeply, maybe kernel-level, that reminds you to do things',
              '- can block apps/actions and cannot be casually evaded by future-you with weak morals',
              '- optional second human in control, so emergency exceptions need actual justification',
              '',
              'hybrid email/im protocol:',
              '- one protocol to replace both email and instant messaging',
              '- async when you need peace, instant when you need chaos',
              '',
              'self-mutable tracker:',
              '- describe the data in natural language',
              '- app builds the views/widgets automatically',
              '- styling also customizable by natural language because CSS is a negotiation',
              '',
              'hybrid immutable OS:',
              '- system declared in immutable config, like NixOS energy',
              '- optionally allow runtime changes',
              '- on shutdown/boot, detect changes and intelligently suggest a new config state',
              '',
              'fitness necklace:',
              '- fitness tracker in necklace form',
              '- harder to forget than a watch, easier to pretend it is jewelry and not surveillance for steps',
              '',
              'Last edited: 18 BC.',
            ],
          },
          'git-history.txt': {
            type: 'file',
            content: [
              'commit messages, roughly:',
              '- "fix"',
              '- "fix for real"',
              '- "okay now it is actually fixed"',
              '- "revert fix because fix broke other thing"',
              '- "final fix (do not revert)"',
              '- "emergency revert"',
            ],
          },
          'meeting-notes.txt': {
            type: 'file',
            content: [
              'Attendees: me',
              'Decision: postpone decision',
              'Action item: create better action item',
              'Follow-up: schedule fewer meetings with myself',
            ],
          },
          'sleep-schedule.txt': {
            type: 'file',
            content: [
              'Planned: 11pm.',
              'Actual: watched one more video. Then another.',
              'Philosophical: is it tomorrow if you have not slept yet?',
              'Current stance: no. It is still today. I decide this.',
            ],
          },
          'things-i-googled.txt': {
            type: 'file',
            content: [
              'how to center div vertically (totally not the hundredth time)',
              'how to stop buying domains for projects that do not exist yet',
              'how to make money while sleeping',
              'how to not be cool (I am too awesome)',
            ],
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
          'api-key-backup.txt': {
            type: 'file',
            content: ['u naughty.', 'do not go around looking for people private secrets.'],
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
