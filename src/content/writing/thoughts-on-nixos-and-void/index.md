---
title: My thoughts on NixOS and Void Linux
description: Why I keep bouncing between Void and NixOS
date: 2026-01-23
tags:
  - linux
  - personal
draft: false
---

I keep bouncing between Void and NixOS. It's been years of hopping, but lately it's mostly those two.

Back when I was on Arch, I found Void as a lightweight alternative. I didn't really care about the systemd debate, I was just tired of my system breaking from dependency conflicts. You know the drill: on Ubuntu-based distros you add third-party repos, on Arch you use the AUR, and eventually something breaks.

Void has honestly been one of the most stable experiences I've had with a "normal" distro. People say its package repo is modest, but I never felt like I was missing much.

Then came NixOS. The immutable distro everyone was talking about. The "high learning curve" warnings didn't turn me off. After trying it, yeah, it's different. But even without really learning Nix syntax properly, I was able to set up my workspace.

Here's my honest take: 90% of the time, NixOS offers convenience and time savings far beyond any distro I've used. With `services.*`, I can deploy almost any service with just a few lines of config. `nix-shell` is great for temporary experiments. And if I ever break my system, I just boot into the previous generation. How nice is that!

But the remaining 10%? When you want to do something that's not officially supported or not "the Nix way", it becomes way harder than on normal distros. That's why I switched back to Void the last time. I was struggling to set up my web dev environment for learning, and I just needed things to work.

Overall, I still prefer NixOS so much that I've switched back to it. I initially didn't think much about making the switch, but then I found a cheap object storage offer and set up backups - having that safety net made the decision easier. You can read about my backup setup [here](/writing/restic-backup).

**Edit:** I just remembered that one of the big friction points I had with NixOS last time was running Prisma. Now that I'm back, I tried setting it up again following the official guide, but still had no luck. Luckily, I found [nix-prisma-utils](https://github.com/VanCoding/nix-prisma-utils) and it worked like a charm.
