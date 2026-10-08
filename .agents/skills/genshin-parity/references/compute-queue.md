# The Compute Queue

Read when a solve, fit, calibration, render, `compare` or any other long run is owed and no judgement is left in it, or when picking one up.

A build writes the script; the run waits in the queue. A queue item is work whose every call is already made, so it is a `haiku` runner's: the main session decides what is owed and what a result means, never waits on the run itself. The flow around it is `apps/web/content/docs/architecture/agent-batches.md`.

## An item

One line under the roadmap's **Compute queue** (`apps/web/content/docs/genshin/roadmap.md`), carrying everything a runner needs and nothing it must decide:

- its lane, `[page]` or `[cpu]` (see **The lanes** on this page), first;
- the exact command, from the repo root, with every argument;
- what it reads, paths outside the repo named (`~/Esposter/genshin-parity/...`);
- what it writes;
- the measure that says it worked, with its bar.

An item missing any of these is not queued: the gap is a call, and calls are the main session's. Items stand in the recreation passes' order, so the queue reads top to bottom. An item waits on the earlier passes **its measure reads**, not on every earlier pass: a sun solved on the exports' shadow edges reads the shape and the camera, so it runs while the surface is still red, and a light pass that scores our stone's colour does not. Releasing an item past a red pass is the main session's call, made by naming what its measure reads.

## The lanes

- **`[page]`** covers anything that drives the parity page: `compare`, `rank`, `film`, `listen`, `calibrate` and every witness command.
  - It renders on the GPU, and an edit to world or engine source reloads the page and kills every run on it.
  - So the lane has **one runner**, working in **one runner worktree**: `<scratchpad>/wt-runner`, cut from `origin/ai/queue`, installed once and reused, and fast-forwarded between items. The parity page is served from that worktree.
  - A batch's edits in the shared checkout never touch it.
- **A screen being built** is not a queue item: a `haiku` agent bringing a 2D screen to the game's likeness runs its own parity page from the shared checkout on a port of its own (`pnpm -C packages/genshin-world exec vite --config parity/vite.config.ts --port <port> --strictPort`, with `GENSHIN_PARITY_PORT=<port>` on its `genshin:parity` commands), so its edit-and-compare loop never waits on the queue. A 2D comparison takes seconds, so a reload from another agent's edit costs one retry. Each page and its browser hold a gigabyte or so, so a few run at once under the memory gate, and each agent stops its own server when it ends.
- **`[cpu]`** covers fits, solves, extraction and sampling that read files and need no page. They run in the shared checkout, a few at once.

## Running one

1. **Claim it.** Take the top unclaimed item of your lane, append ` — running` to its line, and commit that one line straight away, so no other runner takes it.
2. **Check the memory first.** If free physical memory is under about 4 GB (read off `Get-CimInstance Win32_OperatingSystem`, in kilobytes), wait for a run to end before starting another. Thrashing slows every run more than waiting does.
3. **Run it in the background.** The runner reads its output when it ends, never with a foreground wait.
4. **If the measure meets its bar,** commit what the command wrote (data, a report row) and delete the item from the queue in the same commit. The roadmap holds open work only.
5. **If the measure misses,** commit nothing and change no parameter. Put the number on the item's line in place of ` — running`, and report it. A miss is a call for the main session, never a second run with a guessed value.
6. **Take the next item of the lane,** until it is empty. Then report and end.

## Keeping it busy

The queue is never left idle while it holds items.

- **Who starts runners:** the main session starts a runner for each lane with work as soon as an item lands.
- **How many:** the `[page]` lane always has one runner. The `[cpu]` lane runs a few at once, the count set by the cores and the free memory.
- **Nothing schedules it:** a runner loops through its lane by itself (step 6).
