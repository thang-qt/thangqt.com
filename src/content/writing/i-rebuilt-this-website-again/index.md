---
title: I rebuilt this website again
description: Finals are coming, so naturally I rebuilt my website into a tiny desktop OS.
date: 2026-06-06
tags:
  - personal
  - web
  - design
---

Finals are coming, so of course this was the perfect time to rebuild my website again. Right?

The original idea came from [PostHog](https://posthog.com) a while ago. More recently, I checked out [Poolsuite](https://poolsuite.net) again and was pleasantly surprised by how coherent and nice its desktop experience felt. It is playful without becoming confusing, and everything feels like it belongs together.

Naturally, I decided to make my own version.

At first, I built something relatively simple that resembled Poolsuite and migrated everything from the old site. Most of the site's shape and content were still there, just placed inside windows with a desktop around them.

Then I started taking inspiration from Linux ricing and [r/unixporn](https://www.reddit.com/r/unixporn/). I decided to keep one floating navbar instead of adding a traditional desktop panel or bar. It felt cleaner and gave the site a little more of its own personality.

You might think this would be a great setup for a tiling-window-manager-style interface. I agree. Visually, it would be very cool.

However, I do not think tiling is very useful for this website. More importantly, this is a portfolio: visitors should be able to discover things naturally. Opening lots of windows would not play nicely with a traditional tiling layout. A scrollable window manager like [Niri](https://github.com/YaLTeR/niri) could handle it, but that would probably be even less suitable for a website.

The good news is that I implemented some basic keyboard shortcuts, so you can still keep using your keyboard and pretend this is a serious operating system. Press `?` if you want to learn them.

Migrating the old pages and content was easy. The hardest part was redesigning each page to match the new aesthetic. That was by far the most time-consuming part, with a lot of small decisions, revisions, and moments of staring at the screen wondering why one card felt slightly wrong.

Eventually, the site reached a good shape. But having an OS-like website with only a few normal web pages inside it felt wasteful.

So I added a chat app. You need to supply your own API key, but do not worry: it all stays local in your browser.

Then, finally, I added the most fitting app: a terminal. It is basic, but arguably the best part of the site for visitors. You should really check it out. 😉

I also decided to open-source this version. If you want to look inside, borrow an idea, or investigate how many small hacks it takes to make a website pretend to be an operating system, visit the [repository](https://github.com/thang-qt/thangqt.com). The [previous version remains on the `old` branch](https://github.com/thang-qt/thangqt.com/tree/old) if you want to compare them or witness how quickly I change my mind.

I hope you have a good time exploring.

And whatever you do, do not release the cat.

If you know what I mean. :)
