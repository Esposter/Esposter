---
title: Machine efficiency
description: How the local machine runs the work — the lanes, each worktree's dev server, each command's own browser, the one-off checks through memory-gated slots, the machine watcher and the memory gate, with the measured magnitude of each.
---

# Machine efficiency

The work on this machine is many agents and a few long runners sharing one set of cores, one GPU and about 32 GB of memory. The rules an agent follows are in the `throughput` skill (`.agents/skills/throughput/references/machine-efficiency.md`); this page covers what each one buys, with the magnitude measured on this machine.

## How the work runs

A **lane** is one thing doing work on the machine: the main session, a `haiku` agent in a wave, or a compute-queue runner. Every lane gets the same few shared resources, and four rules keep them from stacking up:

- **Each worktree serves its own parity page.** A runner's worktree starts its dev server on port 3002, and the shared checkout's page is served once on 3011 for the main session. A server holds its memory flat across page loads, so one per lane costs little.
- **Each command launches its own browser.** A parity command opens an Edge for its own life and closes it with its page, so no browser outlives the command that started it, and a browser that grows across pages never builds up.
- **Every heavy run takes a slot.** A typecheck, a build or a test run goes through `run-in-slot.sh`, which lets four of them run at once, each only while free memory is above an eighth of the machine's RAM, and holds the rest back. A tsdown build peaks near 2 GB, and many agents building at once took free memory down to about 1.3 GB; a fixed two slots then held the cores at about 37% with agents queued, so the count keeps the cores fed and the gate keeps memory. The gate reads memory as it stands, so builds admitted together all passed it on the same free gigabytes: on 2026-10-09 four genshin-world builds started within a minute of each other reached about 3 GB each within their first minute and took free memory to 1.8 GB. A new run waits for the one admitted before it to pass its first minute or end, with the check and the take under one lock, so each admission reads the memory the one before it grew into.
- **A worktree commit borrows the main checkout's tools.** The pre-commit hook used to run `pnpm` in a fresh worktree, which installed the whole workspace there and failed on an unbuilt `@esposter/shared` (102 to 179 s across three runs, each failing); its check, formatter and oxlint now run from the main checkout's install, and its ESLint is skipped, since ESLint's config loads the worktree's own install.
- **The memory gate and the machine watcher hold the rest.** Before a heavy run starts it reads the free memory and waits at the gate, about 4 GB here, as the throughput skill sets out. The machine watcher (`pnpm ai:machine:watch`, under Monitor) wakes the session only when the machine has gone idle or the gate is hit, so nothing polls. It also pushes the machine's heartbeat, a `refs/machines/<id>` commit every ten minutes carrying its CPU, GPU and free memory, which `pnpm ai:fleet:status` reads for the whole fleet ([Fleet](/docs/architecture/fleet)); a failed push prints one line and the watcher carries on.

```mermaid
flowchart TD
  G["Memory gate — read free RAM,<br/>wait while under an eighth of RAM, about 4 GB here"] -->|"holds new starts"| L
  W["pnpm ai:machine:watch under Monitor —<br/>silent while busy, one line when idle or tight"] -->|"idle: start what can run"| L
  L["A lane — the main session, a haiku agent or a runner"] --> DS["Its worktree's dev server<br/>3002 runner, 3011 shared checkout"]
  L --> CMD["A parity command"]
  CMD --> EDGE["Its own Edge, closed with its page"]
  L --> SLOT["run-in-slot.sh — typecheck, build or tests"]
  SLOT -->|"four slots, taken by mkdir above the memory gate,<br/>one admission a minute while the last runs"| RUN["One heavy run at a time per slot"]
  L --> SEARCH["rg over what git tracks"]
  L --> VIDEO["GPU video decode for a whole-video scan"]
```

## The mechanisms and what they save

| Mechanism                                                        | Status   | Measured magnitude                                                                                                                                                                                                                             |
| :--------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One dev server per lane                                          | Kept     | About 0.65 GB, flat over ten page loads; page ready in 1.6–1.9 s warm. A static build would be the alternative, but the page does not build as the repository stands, so no ratio is stated                                                    |
| Each command's own Edge                                          | Kept     | 0.73 GB while a page is open and none after it closes, against a shared browser that grew to about 2.97 GB over ten pages                                                                                                                      |
| The shared Edge                                                  | Removed  | 1.4× faster per page (a 2.0 s launch against 1.4 s shared), and about 4× the memory of a launch after ten pages, so it was removed                                                                                                             |
| One-off checks, not a standing watcher                           | Kept     | About 750× less memory-time per check than an hour of watcher on `scripts`, which breaks even only above about 750 checks an hour                                                                                                              |
| Two heavy-run slots                                              | Replaced | Half the concurrent heavy runs: four launched together ran four at once without the slot and two with it, which held the cores at about 37% with agents queued, so the count is four and the memory gate keeps memory                          |
| `rg` over `grep -r` from the repository root                     | Kept     | More than 200× faster: `rg` takes about 4 s, while `grep -r` ran over 900 s in two runs without printing a match                                                                                                                               |
| GPU video decode for a whole-video scan                          | Kept     | 2.4× faster: a luma scan of the first 60 s of a capture takes about 65 s on the GPU at 64 pixels wide, against about 155 s decoding on the CPU at full size                                                                                    |
| GPU vocoder for the persona's spoken lines (DirectML on Windows) | Kept     | About 85% less CPU time for five lines (a median of 379 CPU-seconds in the process on the CPU rung, 57 on the top rung), and each line's wall time the same or lower; the language model stays on WebGPU, since DirectML rejects a slice in it |
| Surface statistics on the parity page's GPU                      | Kept     | 3.1× less wall time for the Surface pass (427 s to 137 s) and 6× less Node CPU (352 s to 58 s), every figure matching the CPU run                                                                                                              |
| Colour pass's label similarity on the same GPU                   | Kept     | The Surface pass 16% less wall time (109 s to 92 s) and about half its Node CPU (46 s to 24 s), medians of three, every printed figure unchanged                                                                                               |
| Spectrogram once per signal in `scoreShapedMusic`                | Kept     | 2.3× less time per call (a median of 880 ms over five calls to 385 ms, three runs each), from eight STFTs to three, every hashed output unchanged on equal and truncated lengths                                                               |
| Twiddle table in `transformFourier`                              | Kept     | 44% less time per 2^12 transform (a median of 226 µs over three runs to 126 µs), every output bit-identical over 42 sizes and inputs from 2 to 16384 points                                                                                    |
| `notes` on one parity page, the game read once                   | Kept     | 1.3× less wall time (a median of 194 s over three runs to 145 s): one Edge launch in place of six and each segment's game read and spectrogram once, every line printed and the written `music.json` identical                                 |

The shared Edge saved time while it was kept, and it was removed once its growth was measured. Its growth was not traced to a cause, so a relaunch every few pages was not added: each page launches its own browser, which closes back to nothing, so there is no growth to bound. The GPU row measures the scan's time alone; the peak memory of the two decodes was not captured.

## Key files

| File                                                                          | Role                                                                                                                         |
| :---------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| `.agents/skills/throughput/references/machine-efficiency.md`                  | The rules an agent follows: slots, one check per package, search and long-run placement                                      |
| `.agents/skills/throughput/scripts/run-in-slot.sh`                            | Runs one heavy command in one of four machine-wide slots, taken only above the memory gate and a minute after the last one   |
| `scripts/src/machine/watch/index.ts`                                          | Watches the CPU, GPU and free memory under Monitor, prints the idle and tight lines, sweeps orphans and pushes the heartbeat |
| `scripts/src/services/genshinParity/shared/openParityPage.ts`                 | Launches the page's own Edge with the flags an unlimited frame rate needs, and closes it with the page                       |
| `scripts/src/services/genshinParity/shared/constants.ts`                      | The page's port, `GENSHIN_PARITY_PORT`, 3011 for the shared checkout and 3002 for a runner                                   |
| `packages/genshin-world/parity/vite.config.ts`                                | The parity page's dev server, which each worktree serves on its own port                                                     |
| `packages/genshin-world/parity/surfaceStatistics/computeSurfaceStatistics.ts` | The surface statistics reduced on the parity page's WebGPU device: the blurs as compute passes, only partial sums read back  |
| `packages/genshin-world/parity/surfaceStatistics/computeLabelSimilarity.ts`   | The colour pass's label similarity on the same device, each scale's term map read back                                       |
