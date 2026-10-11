---
title: Machine efficiency
description: How the local machine runs the work — the lanes, each worktree's dev server, each command's own browser, the one-off checks through memory-gated slots, the machine watcher and the memory gate, with the magnitude each one buys.
---

# Machine efficiency

The work on a machine is many agents and a few long runners sharing one machine's cores, GPU and memory: the PC (Windows 10, many cores, about 32 GB) or the M1 MacBook Air (four performance and four efficiency cores, 16 GB, fanless). The rules an agent follows are in the `throughput` skill (`.agents/skills/throughput/references/machine-efficiency.md`); this page covers what each one buys and why it is shaped the way it is.

## How the work runs

A **lane** is one thing doing work on the machine: the main session, a `haiku` agent in a wave, or a compute-queue runner. Every lane gets the same few shared resources, and four rules keep them from stacking up:

- **Each worktree serves its own parity page.** A runner's worktree starts its dev server on port 3002, and the shared checkout's page is served once on 3011 for the main session. A server holds its memory flat across page loads, so one per lane costs little.
- **Each command launches its own browser.** A parity command opens an Edge for its own life and closes it with its page, so no browser outlives the command that started it and none grows across pages.
- **Every heavy run takes a slot.** A typecheck, a build or a test run goes through `run-in-slot.sh`, which lets half the machine's physical performance cores' worth of them run at once, from one to four, and only while free memory is above an eighth of the machine's RAM. Slots are sized to the cores, so a fixed count is not used: a fixed two held the PC's cores at about 37% with agents queued. A tsdown build peaks near 2 GB, so the memory gate, not the count, keeps many concurrent builds from exhausting memory. The gate reads memory as it stands, so builds admitted together would all pass it on the same free memory; a new run therefore waits for the one admitted before it to pass its first minute or end, with the check and the take under one lock. On macOS each run starts under `taskpolicy -c utility`, so a batch run stays behind the user's foreground apps on a fanless machine. A run waiting for a slot polls at a backed-off interval, starting at 2 s and settling at 10 s. A build-cache miss takes a slot the same way, through the node gate that shares the shell gate's slot directory and admission record, so a build and a typecheck never stack their memory; a restore takes none.
- **A worktree commit borrows the main checkout's tools.** The pre-commit formatter runs from the main checkout's install, so a fresh worktree needs no install of its own for its commit, and the hook runs no check.
- **The memory gate and the machine watcher hold the rest.** Before a heavy run starts it reads the free memory and waits at the gate, 2 GB on the Mac and 4 GB on the PC, as the throughput skill sets out. The machine watcher (`pnpm ai:machine:watch`), which the [pulse mod](/docs/infra/claude-interface/genshin-mods/pulse) keeps running, wakes an idle session once there is fleet work for it, so nothing polls. It also pushes the machine's heartbeat, a `refs/machines/<id>` commit every ten minutes carrying its CPU, GPU and free memory, which `pnpm ai:fleet:status` reads for the whole fleet ([Fleet](/docs/architecture/fleet)); a failed push prints one line and the watcher carries on.

```mermaid
flowchart TD
  G["Memory gate — read free RAM,<br/>wait while under an eighth of RAM (2 GB Mac, 4 GB PC)"] -->|"holds new starts"| L
  W["pnpm ai:machine:watch, kept running by the pulse mod —<br/>writes its reading each minute"] -->|"idle line: the pulse wakes the session"| L
  L["A lane — the main session, a haiku agent or a runner"] --> DS["Its worktree's dev server<br/>3002 runner, 3011 shared checkout"]
  L --> CMD["A parity command"]
  CMD --> EDGE["Its own Edge, closed with its page"]
  L --> SLOT["run-in-slot.sh — typecheck, build or tests"]
  SLOT -->|"slots of half the performance cores,<br/>above the memory gate, one start a minute"| RUN["One heavy run at a time per slot,<br/>under the utility clamp on macOS"]
  L --> SEARCH["rg over what git tracks"]
  L --> VIDEO["GPU video decode for a whole-video scan"]
```

## What each mechanism buys

Each row is the magnitude the mechanism is kept for. The readings behind a row live with the artifact that holds them, not here.

| Mechanism                                                        | Magnitude                                                                                                                                                |
| :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One dev server per lane                                          | Flat memory across page loads, so one per lane costs a fixed sliver of RAM, not a sliver per page                                                        |
| Each command's own Edge                                          | Its memory is released when its page closes, so a shared browser's growth across pages never builds up                                                   |
| One-off checks, not a standing watcher                           | A check costs a small fraction of the memory-time an always-on watcher holds, so the watcher pays only for a very high check rate                        |
| Slots sized to the machine's performance cores                   | Admits about the count the cores can feed: two on the fanless Mac, where a fixed four ran more heavy runs at once than it could feed, and four on the PC |
| Utility QoS clamp on slot runs (macOS)                           | Keeps batch threads behind foreground work; the wall-time gap it leaves is small and mostly machine load                                                 |
| Backed-off slot polling                                          | A waiting run wakes a few times a minute, so a queue of waiting runs costs little in process spawns; the price is a few seconds of admission latency     |
| The parity directory under `~/Esposter.noindex` (macOS)          | Spotlight stops indexing the extraction, which adds over a million files per run; `~/Esposter` is a symlink to it, so every path still resolves          |
| `rg` over `grep -r` from the repository root                     | Two orders of magnitude faster, and it skips what git does not track                                                                                     |
| GPU video decode for a whole-video scan                          | Several times faster than a CPU decode at full size, since the scan needs a low-resolution luma plane                                                    |
| GPU vocoder for the persona's spoken lines (DirectML on Windows) | Most of the CPU time of a line is moved off the CPU; the language model stays on WebGPU, since DirectML rejects a slice in it                            |
| Surface statistics on the parity page's GPU                      | Several times less wall time and far less Node CPU than the CPU pass, with every printed figure matching it                                              |
| Colour pass's label similarity on the same GPU                   | A smaller share of the Surface pass's wall time and about half its Node CPU, with every printed figure unchanged                                         |
| Spectrogram once per signal in `scoreShapedMusic`                | About a third of the STFTs per call, with every hashed output unchanged                                                                                  |
| Twiddle table in `transformFourier`                              | Under half the time per transform, with every output bit-identical                                                                                       |
| `notes` on one parity page, the game read once                   | One browser launch in place of one per segment, and each segment's game read and spectrogram once, with the written output identical                     |

The one-off mechanisms that were tried and removed are not kept here: a mechanism that was measured and dropped has no rule left to state. The GPU rows measure the scan's time alone; a peak memory figure for the decodes is not recorded.

## Key files

| File                                                                          | Role                                                                                                                                                                     |
| :---------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.agents/skills/throughput/references/machine-efficiency.md`                  | The rules an agent follows: slots, one check per package, search and long-run placement                                                                                  |
| `.agents/skills/throughput/scripts/run-in-slot.sh`                            | A thin wrapper that starts the node gate with node from the caller's directory, so the command's exit status is the gate's                                               |
| `scripts/src/runInSlot/index.ts`                                              | The gate's citty entry: runs the command after `--` once a machine-wide slot is free, under the utility clamp on macOS and a node heap capped at a quarter of the RAM    |
| `scripts/src/services/buildCache/runInSlot.ts`                                | The one slot gate, which a build-cache miss and every `run-in-slot.sh` command share; a gate nested in a slot its parent holds (`ESPOSTER_RUN_IN_SLOT` set) runs at once |
| `scripts/src/machine/watch/index.ts`                                          | Watches the CPU, GPU and free memory, writes its reading to the state file, prints the idle and tight lines, sweeps orphans and pushes the heartbeat                     |
| `scripts/src/services/genshinParity/shared/openParityPage.ts`                 | Launches the page's own Edge with the flags an unlimited frame rate needs, and closes it with the page                                                                   |
| `scripts/src/services/genshinParity/shared/constants.ts`                      | The page's port, `GENSHIN_PARITY_PORT`, 3011 for the shared checkout and 3002 for a runner                                                                               |
| `packages/genshin-world/parity/vite.config.ts`                                | The parity page's dev server, which each worktree serves on its own port                                                                                                 |
| `packages/genshin-world/parity/surfaceStatistics/computeSurfaceStatistics.ts` | The surface statistics reduced on the parity page's WebGPU device: the blurs as compute passes, only partial sums read back                                              |
| `packages/genshin-world/parity/surfaceStatistics/computeLabelSimilarity.ts`   | The colour pass's label similarity on the same device, each scale's term map read back                                                                                   |
