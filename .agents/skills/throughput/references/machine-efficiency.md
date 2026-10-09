# Machine Efficiency — Every Run Once, on the Cheapest Resource

Read when a wave starts, when an agent is about to check, build, search or scan, and when the CPU is pinned while the GPU idles.

A wave of agents multiplies every habit by the number of agents. A typecheck each agent runs before each commit is the same check run a dozen times over a tree that changes under all of them. So every search reads only what git tracks, every long run goes to whichever of the cores, the GPU or the video engine does it cheapest, and each check runs once, by the agent that needs it.

## Every improvement ships, measured, and trims what it replaced

- **An efficiency gain found in any work is built then**, as its own unit, never noted for later: a check run twice, a process held by nothing, a server per lane that one could serve, a mechanism a simpler one now covers.
- **It is measured before and after, on this machine.** Memory of the process tree, time to ready and CPU seconds, as medians over a few runs. The numbers decide it: a mechanism that saves nothing measurable is removed, however sensible it sounded.
- **What it replaced goes in the same change.** The old script, flag, port, rule or prose line is deleted, not left beside the new one, so the machine never runs both and the reader never wonders which holds.
- **The architecture is a docs page with its diagram.** How the local lanes, servers, browsers and checks fit together, with a magnitude for what each one saves, is `apps/web/content/docs/architecture/machine-efficiency.md`. This page keeps only the rules an agent follows.

## Checks run once, before the commit

- **Every heavy run takes a slot.** An agent's one-off typecheck, build and test run goes through `bash .agents/skills/throughput/scripts/run-in-slot.sh <command>`, which runs it in one of four machine-wide slots, taken by an atomic `mkdir` only while free memory is above the gate (an eighth of the machine's RAM). It frees a slot whose holder died, or that got no holder within a minute, one runner at a time under a lock, so two runners never free the same slot and one never frees a slot just retaken. The measurements behind the count and the gate are in `apps/web/content/docs/architecture/machine-efficiency.md`. A run in a slot also gets a node heap cap of a quarter of the machine's RAM, unless `NODE_OPTIONS` already sets one: the app's whole-workspace typecheck held 10.7 and 12.6 GB on 2026-10-09 and took free memory to 0.5 GB, and under the cap it fails fast instead, since it is CI's job.
- **An agent typechecks each package it edited once, before its commit.** It runs that package's own incremental check, `pnpm exec tsc --noEmit` (or `pnpm exec vue-tsc --noEmit` in a package with `.vue` files), through the slot, at below-normal priority after the memory gate. A pass takes a few seconds and peaks under about two gigabytes, so a one-off check beats a standing watcher unless it runs more than about 750 times an hour, the break-even measured for `scripts`. An agent never checks `apps/web`, whose typecheck is CI's.
- **It fixes the errors in its own files.** One in another agent's half-written file is that agent's to fix.
- **Lint: the touched files only.** Run `vp lint --disable-nested-config <files>` and `pnpm exec eslint <files>` from the package, never the package's whole `pnpm lint`.
- **Tests: the touched tests only,** through the slot: `pnpm exec vitest run <paths>`.
- **Build: only to regenerate a barrel.** After an agent adds, renames or deletes a module file, it runs `pnpm exec tsdown --no-clean` through the slot, never `pnpm build`; otherwise it does not build at all. The parity page and every sibling's typecheck read a package's source through its `source` export condition and the generated barrel, and the user's `nuxt dev` rebuilds every package itself.
- **A worktree commit never runs `pnpm`.** The pre-commit hook takes its tools from the main checkout's install when the worktree has none, because `pnpm` there installs the whole workspace first.
- **Everything else is the fixer's, once.** When every report is in, one `haiku` fixer runs each touched package's full checks and its build once and repairs what fails. CI on the push is the backstop.

## Search what git tracks

- **Search with `rg`, `git grep` or the Grep tool.** All of them skip `node_modules`. A `grep -r` from a folder that holds one reads every installed package, piped into `grep -v node_modules` after the fact, and costs a minute of a core every call.
- **Read a large JSON with `node`, never with `grep -o`.** A data dump is often one line tens of megabytes long, and `grep -o` over it ran for over half an hour.

## Long runs

- **Read the memory gate first.** Before a test run, a build or a page, read the free memory (`(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB`) and wait while it is under an eighth of the machine's RAM, about 4 GB here. A machine that swaps slows every run more than one that waits.
- **Run a long CPU job at below-normal priority.** Use PowerShell `Start-Process … -PassThru` and then set `.PriorityClass = 'BelowNormal'`, or `start /belownormal`. The agents' checks and the page lane then keep their cores.
- **Measure a run's Node CPU from its own process tree.** Sum the node processes under the launched one, sampled as the run goes: a match on the command line counts another session's run too, and a browser's CPU is not the Node CPU.
- **Decode a whole-video scan on the GPU, at a small size.** Pass `-hwaccel d3d11va` to use the GPU's video engine, and scale each frame down before any per-frame filter (`scale=64:-2` ahead of `signalstats`). A luma scan only needs one number per frame.
- **Sweep the orphans.** An agent that ends can leave its background processes running.
  - The machine watcher (`pnpm ai:machine:watch`) stops an orphaned `find`, `du`, `grep` or `rg` on sight, once that process itself has burnt more than half a minute of CPU. On Windows its MSYS parent decides only whether it is orphaned, since a Git tool's Win32 parent can exit while its bash lives. An agent's `find /` ran for half an hour on 2026-10-09 before anyone saw it.
  - The main session sweeps the rest: an `ffmpeg`, or a `tail -f` feeding a dead monitor.
- **Never scan the disk for a file whose home is known.** The game's data is under `GENSHIN_PARITY_DIRECTORY` (`~/Esposter/genshin-parity`) and its text under the `GENSHIN_TEXT_*` folders. Look there; never `find /` or `du` a home folder, and the Bash guard refuses it. A tool is never searched for either: the pinned ones (FFmpeg, yt-dlp, the decompiler, vgmstream) resolve through `resolvePinnedTool`.

## Watch the machine

- **A watcher wakes the session, so nothing polls.** While agents or runners are working, the main session runs `pnpm ai:machine:watch` under the Monitor tool, re-armed at each expiry. It is one command on Windows and macOS alike, reading the CPU, the GPU and the free memory each minute. It is silent while the machine is busy. It prints one line when the CPU has averaged under 80% for three minutes with more than three sixteenths of the machine's RAM free (6 GB here), and one when free memory falls under an eighth of it (the 4 GB gate here). Either line repeats every 15 minutes while its state holds.
- **An idle line is a call to start what can run:** a lane's runner for a runnable item, a page per independent scene, the next wave's ready units.
- **A machine idle because nothing can run is correct.** That line is answered by saying so. No item is queued, and no unit invented, to fill the cores: a queue that only grows is never digested.
- **A tight line holds new starts** until memory comes back.
- **A package that fails to load while `pnpm i` reports up to date is a partly wiped folder.** Pnpm checks the lockfile, not the files, so delete that one `node_modules/.pnpm/<pkg>@<ver>` folder and run `pnpm i --frozen-lockfile --prefer-offline`; the folder is rebuilt from the store.

## Keep the GPU busy

- **The GPU is already the one doing the work.** Headless Edge gets the machine's own AMD RDNA 3 adapter by default, and the launch flags tried (`--use-angle=d3d11`, `--ignore-gpu-blocklist`, `--enable-unsafe-webgpu`) change nothing that matters: the last adds three features, and a launch forced onto SwiftShader gets no adapter at all. A bench's frame is set by the main thread instead: in a 475-mesh scene about nine of its twelve milliseconds a frame are main-thread work, so a low GPU share is that scene's draw loop, not a missing flag.
- **The page lane runs several scenes at once.** Its runner serves every item's page from its one parity server in its own worktree (port 3002), as `.agents/skills/genshin-parity/references/compute-queue.md` sets out.
- **A GPU idle while the queue holds items is a lane waiting on a miss.** A miss is a call only the main session makes, so it settles the misses before anything else: each holds the GPU.

## Tokens are a resource too

- **Haiku implements and opus settles the calls** (the `llm-delegation` skill). An opus agent stopped part way ends on a handoff spec. The main session lifts the spec out of the agent's transcript with a script into a file the next agent reads, never by reading the transcript itself.
- **The last tenth of a usage window belongs to the compute queue** (the usage reserve, in this skill's `SKILL.md`).
