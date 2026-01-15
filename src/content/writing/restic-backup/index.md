---
title: Setting up backup with restic (and switching back to NixOS)
description: Finally setting up proper backups, and using it as an excuse to distro-hop again
date: 2026-01-15
tags:
  - linux
  - personal
  - backup
draft: true
---

I recently came across a cheap object storage offer. It got me thinking about backups, one of those things I always tell myself I'll set up "eventually." Well, this is eventually.

And it's also the perfect excuse to try NixOS again. The plan is simple: set up backups on my current Void system first, then jump to NixOS with a safety net. If anything goes wrong or I regret it, I can just restore and be back on Void with minimal hassle.

To give some context, I've been hopping distros for years, but recently it's just been between Void and NixOS.

Back when I was on Arch, I heard about Void as a lightweight alternative. I didn't really care about the whole systemd debate, I was just tired of my system breaking, especially from dependency conflicts. You know the drill: on Ubuntu-based distros you pull packages from third-party repos, on Arch you use the AUR, and eventually something breaks.

Void has honestly been one of the most stable experiences I've had with a "normal" distro. People say its package repo is modest, but I never found myself missing anything.

Then came NixOS. The cool new kid, the immutable distro everyone was talking about. The "high learning curve" warnings didn't turn me off. After trying it, yeah, it is different. But even with modest knowledge, without really learning Nix syntax properly, I was able to set up my workspace.

Here's my honest take: 90% of the time, NixOS offers convenience and time savings far beyond any distro I've used. With `services.*`, I can deploy almost any service with just a few lines of config. The `nix-shell` is great for temporarily testing things out. And if I ever break my system, I just boot into the previous generation. How nice is that?

But the remaining 10%? When you want to do something that's not officially supported or not "the Nix way", it becomes way harder than on normal distros. That's why I switched back to Void. At the time, I was having trouble setting up my web dev environment for learning, and I just needed things to work.

So why am I switching back now? I miss the 90% too much.

New year, fresh start. Do I expect my previous problems to be solved? Not really. But if push comes to shove, I might just use Distrobox or something similar to handle the edge cases.

Anyway, let's get into the actual backup setup.

**Setting up restic on Void**

<!-- TODO: Write about the Void setup -->

**Setting up restic on NixOS**

<!-- TODO: Write about the NixOS setup -->

<!-- TODO: Closing thoughts -->
