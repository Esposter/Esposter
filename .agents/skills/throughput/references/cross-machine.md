# Cross-Machine Compute — Two Checkouts, One Queue

Read when a second machine works the same backlog: when a unit is assigned to it, when either machine syncs or pushes, when game data has to reach it, and when its utilization comes in.

The Windows PC's main session is the **coordinator**. A MacBook joins as a Remote Control session (`jimmys-macbook-air-local-mighty-wadler` in `ListAgents`) with its own checkout of `ai/queue`. The two share nothing but `origin/ai/queue` and the local network, so every rule here is about what crosses which of the two.

## What goes where

- **The Mac takes Genshin work only.** The user lent it for the game, so no unit of the app's other areas goes to it, however idle it is.
- **The Mac takes the CPU work that needs only the repo, public sources, or exports already copied to it.**
  - The wave fixer: the full test suites and builds of the `genshin-*` packages after each sync, its reds repaired in their own commits. The Windows checkout then never runs a full suite.
  - Implementation units in the `genshin-*` packages.
  - Public-video scans: yt-dlp downloads decoded on its media engine with `-hwaccel videotoolbox`.
  - Generators over `DimbreathBot/AnimeGameData`.
  - Fits and derivations over the exports already copied to it.
- **The Windows PC keeps what reads the installed game:**
  - every `genshin:assets` step that runs AnimeStudio;
  - the `shaders` step, whose disassembler is Windows' `d3dcompiler_47`;
  - the compute queue's page lane, whose references live there.

  This holds until the Mac has the game's blocks of its own.

- **One unit, one machine.** The coordinator names each unit it sends, and never sends both machines units that edit the same file. A hot shared file, the world screen's `Index.vue` above all, belongs to one machine at a time.

## Sync

Both checkouts track `origin/ai/queue`, and the review collector rewrites it behind every window, so a checkout left alone goes stale within the hour.

- **The Mac's checkout is its own**, one session, nothing dirty but its own work. It runs `git pull --rebase` before each unit and before each push, and pushes through `pnpm ai:queue:push` after each coherent chunk, never once at the end of a long unit. A unit left unpushed for an hour is an hour the coordinator plans against a tree that is not there.
- **The Windows checkout is shared and always dirty with agents' edits**, so it never pulls. The coordinator runs `pnpm ai:queue:push` after every agent report. It replays the session commits onto origin in a throwaway worktree, pushes, and moves the checkout's branch when no dirty file conflicts. A branch that "waits" catches up on the first push after the blocking file is committed.
- **Never stash, never `git add -A`, never a bare `--force-with-lease`**, on either machine (the `review-queue` skill).

## Game data crosses the local network only

- **Exports and recordings never travel through git, GitHub, a cloud drive or the Remote Control channel.** They go as a tar stream over TCP on the LAN.
- **The Mac listens and the PC connects.** macOS' application firewall is off by default, while Windows prompts the user on a new listener. This holds in both directions: to pull something back, the Mac listens to send.
- **Each machine sets `GENSHIN_PARITY_DIRECTORY`** (`~/Esposter/genshin-parity`), and a copied folder lands at the same relative path, so every command reads it the same way on both.
- **What the Mac holds:** `extracted`, `text`, `references`, `captures`, `city-areas` and `plans`. `frames` and `tmp` are rebuilt where they are used, never copied.

## Utilization reports

- **Each machine runs `pnpm ai:machine:watch` under Monitor**, the same command on both (`machine-efficiency.md`).
- **The Mac forwards every idle and tight line to the coordinator** with SendMessage and the time, and each unit report closes on a one-line summary: CPU, GPU, free memory, and throttling if any.
- **An idle Mac line is the coordinator's call to send the next unit**, exactly as an idle line on its own machine is. A Mac with nothing ready is told so, never given a unit invented to fill it.
- **A Remote Control send reports nothing back.** Silence from the Mac is not agreement. A unit is the Mac's from the moment it acknowledges it, and the coordinator sends it nowhere else meanwhile.
