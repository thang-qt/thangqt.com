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

---

Okay, so that's what I drafted in advance, or you might say my "planned plan"? However, it suddenly occurred to me that I still have Windows installed on another disk that I haven't touched in ages. Why? you might ask. Well, my professor at the time required us to use this monitored browser for exams, and it only supported Windows. That's why.

Anyway, after that I bought a gamepad on a whim, thinking I'd get some joy out of it. Well, I did. I played RDR with it for a few days, then got bored. After that, I never bothered touching Windows again. So it's the perfect opportunity to nuke it and install NixOS on it.

Anyway, here is the actual backup setup.

**On Void**

<!-- to be written later -->

**NixOS**

Setting up restic on NixOS is where the platform really shines. Instead of manually managing systemd services and timers, NixOS provides a declarative `services.restic.backups` module that handles everything.

I followed [this guide](https://imranmustafa.net/simple-restic-backup-on-nixos/) which breaks down the setup nicely. Here's my configuration:

```nix
{
  config,
  lib,
  pkgs,
  ...
}:

{
  sops.age.keyFile = "/etc/sops/age/keys.txt";

  sops.secrets = {
    restic-password = {
      sopsFile = ../../secrets/restic.yaml;
      format = "yaml";
      key = "restic_password";
      mode = "0400";
      owner = "root";
    };

    restic-s3-access-key = {
      sopsFile = ../../secrets/restic.yaml;
      format = "yaml";
      key = "aws_access_key_id";
      mode = "0400";
      owner = "root";
    };

    restic-s3-secret-key = {
      sopsFile = ../../secrets/restic.yaml;
      format = "yaml";
      key = "aws_secret_access_key";
      mode = "0400";
      owner = "root";
    };
  };

  sops.templates."restic-env".content = ''
    AWS_ACCESS_KEY_ID=${config.sops.placeholder."restic-s3-access-key"}
    AWS_SECRET_ACCESS_KEY=${config.sops.placeholder."restic-s3-secret-key"}
  '';

  sops.templates."restic-repo".content = ''
    s3:https://s3-hcm5-r1.longvan.net/backupqt/hostname/pathway
  '';

  services.restic.backups = {
    pathway-home = {
      initialize = true;
      repositoryFile = config.sops.templates."restic-repo".path;
      passwordFile = config.sops.secrets.restic-password.path;
      environmentFile = config.sops.templates."restic-env".path;

      paths = [ "/home/thang" ];

      exclude = [
        "/home/thang/.cache"
        "/home/thang/.local/share/Trash"
        "/home/thang/.mozilla/firefox/*/cache2"
        "/home/thang/.config/google-chrome/*/Cache"
        "/home/thang/.config/chromium/*/Cache"
        "/home/thang/Downloads"
        "/home/thang/.local/share/Steam"
        "node_modules"
        ".next"
        ".nuxt"
        ".venv"
        ".tox"
        "__pycache__"
        "target/debug"
        "target/release"
        "dist"
        "build"
        ".cache"
        ".pytest_cache"
        ".mypy_cache"
        ".ruff_cache"
        "*.tmp"
        "*.temp"
        ".DS_Store"
      ];

      timerConfig = {
        OnCalendar = "daily";
        Persistent = true;
        RandomizedDelaySec = "5m";
      };

      pruneOpts = [
        "--keep-daily 7"
        "--keep-weekly 4"
        "--keep-monthly 6"
        "--keep-yearly 2"
      ];

      runCheck = false;

      extraBackupArgs = [
        "--exclude-caches"
        "--exclude-if-present .nobackup"
        "--compression auto"
      ];
    };
  };
}
```

A few things worth noting:

- I'm using `sops-nix` to manage secrets securely. The restic password and S3 credentials are encrypted and only decrypted at runtime.
- I'm keeping 7 daily snapshots, 4 weekly, 6 monthly, and 2 yearly. This gives me a good balance between storage usage and recovery options.
- The exclude list covers common cache directories, build artifacts, and temporary files. No point backing up `node_modules` when I can just `npm install` again.

So now I have 2 Linux partitions, a little bit redundant to be honest, but I have no other use so I'm gonna keep the Void one as backup just in case.
