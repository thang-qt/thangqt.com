---
title: Setting up backup with restic
description: Finally setting up proper backups with restic on Void and NixOS
date: 2026-01-23
tags:
  - linux
  - personal
  - backup
draft: false
---

I recently came across a cheap object storage offer. It got me thinking about backups, one of those things I always tell myself I'll set up "eventually." Well, this is eventually.

It also got me thinking about switching back to NixOS (why? I wrote about that [here](/writing/thoughts-on-nixos-and-void)), something I've been considering for a while now. This felt like the perfect opportunity - set up proper backups first, then make the switch with a safety net.

Then I realized I still had a Windows partition sitting unused on another disk. It only existed because my professor required a monitored exam browser for exams, and after that I had a brief gamepad phase where I played RDR for a few days. Haven't touched it since.

So I nuked Windows and installed NixOS there instead. Set everything up, including the backup configuration. After NixOS was stable, I booted back into Void to back it up as well. Now I'm using NixOS as my main system.

Here's the actual setup. I'm presenting NixOS first since that's my main system now, then the Void backup.

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

**On Void**

Setting up restic on Void is more hands-on than NixOS, but it's straightforward. First, install restic:

```sh
sudo xbps-install -S restic
```

Then create a directory for secrets and configuration:

```sh
sudo mkdir -p /etc/restic
sudo chmod 700 /etc/restic
```

Create the password file, environment variables for S3 credentials, and repository URL:

```sh
# Password for the restic repository
sudo hx /etc/restic/password
sudo chmod 600 /etc/restic/password

# S3 credentials
sudo hx /etc/restic/env
# Contains:
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
sudo chmod 600 /etc/restic/env

# Repository URL
sudo sh -c 'echo "s3:https://s3-hcm5-r1.longvan.net/backupqt/hostname/leaf" > /etc/restic/repo'
sudo chmod 600 /etc/restic/repo
```

Initialize the repository:

```sh
sudo sh -c 'export $(cat /etc/restic/env | xargs); restic -r "$(cat /etc/restic/repo)" --password-file /etc/restic/password init'
```

Create an excludes file with patterns for directories and files you don't want backed up:

```sh
sudo hx /etc/restic/excludes
sudo chmod 600 /etc/restic/excludes
```

Mine looks mostly similar to the NixOS config, with a few tweaks.

Create a backup script:

```sh
sudo sh -c 'cat > /usr/local/bin/restic-backup <<EOF
#!/bin/sh
set -e
export \$(cat /etc/restic/env | xargs)

restic -r "\$(cat /etc/restic/repo)" \\
  --password-file /etc/restic/password \\
  backup /home/thang \\
  --exclude-caches \\
  --exclude-if-present .nobackup \\
  --exclude-file /etc/restic/excludes \\
  --compression auto
EOF'
sudo chmod 700 /usr/local/bin/restic-backup
```

Before running the first backup, I cleaned up some junk that had accumulated in my home directory - old `node_modules`, a `go` directory I wasn't using, and some leftover project folders. Then ran:

```sh
sudo /usr/local/bin/restic-backup
```

The first backup was... an iterative process. I kept stopping it (Ctrl+C) to refine the excludes file as I realized what else I didn't need backed up - the Android SDK, more cache directories, temporary files. Each interrupted run uploaded some data before I cancelled it. After a few rounds of tweaking, the final successful run processed 551,006 files (48.39 GiB).

It took over an hour, which was quite long. I suspect it's because I have lots of small files scattered everywhere - config files, dotfiles, all those tiny things that accumulate over time.

Unlike the NixOS setup, I'm not running automated daily backups or pruning here. Since I'm now using NixOS as my main system and will likely store all my data there going forward, this Void backup is just a one-time safety net. I probably won't touch this partition much anymore, and will likely nuke it eventually once I'm fully settled on NixOS.
