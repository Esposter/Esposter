# Machine Efficiency — Every Run Once, on the Cheapest Resource

Read when a wave starts, when an agent is about to check, build, search or scan, and when the CPU is pinned while the GPU idles.

A wave of agents multiplies every habit by the number of agents. A typecheck each agent runs before each commit is the same check run a dozen times over a tree that changes under all of them. So a check every agent needs runs once for all of them, every search reads only what git tracks, and every long run goes to whichever of the cores, the GPU or the video engine does it cheapest.

## Checks run once, for every agent

- **Typecheck: one watcher per package, read by every agent.** When a wave starts, the main session starts one watcher in each package the wave edits. It runs hidden from the package folder: `pnpm exec tsc --noEmit --watch --preserveWatchOutput > ~/Esposter/checks/<package>.log 2>&1`, or `vue-tsc` in a package with `.vue` files. The workspace's `typescript` is the tsgo-backed fork, so an incremental pass takes seconds. The main session stops the watchers when the wave ends.
  - **An agent never runs its own typecheck.** It reads the latest pass that started after its last edit, which is done once it ends on `Found N errors. Watching for file changes.`:

    ```sh
    awk '/Starting (incremental )?compilation/{pass=""} {pass=pass $0 "\n"} END{printf "%s", pass}' ~/Esposter/checks/<package>.log
    ```

  - It fixes the errors in its own files; one in another agent's half-written file is theirs. A package with no log is checked by hand, once.
  - **A watcher costs memory** — half a gigabyte for a small package, two for `scripts` — so watchers run only for the packages a wave is editing. The main session stops a package's watcher and **deletes its log** when the package goes quiet or the memory gate is near, since a stale log reads as a clean pass. A watcher that died leaves a log whose last write stops moving, and it is restarted or its log deleted.
  - The checks folder holds the watchers' logs only; an agent's own scratch output goes in its scratchpad.
- **Lint: the touched files only.** Run `vp lint --disable-nested-config <files>` and `pnpm exec eslint <files>` from the package, never the package's whole `pnpm lint`.
- **Tests: the touched tests only.** Run `pnpm exec vitest run <paths>`.
- **Build: only to regenerate a barrel.** After an agent adds, renames or deletes a module file, it runs `pnpm exec tsdown --no-clean`, never `pnpm build`; otherwise it does not build at all. The parity page and every sibling's typecheck read a package's source through its `source` export condition and the generated barrel, and the user's `nuxt dev` rebuilds every package itself.
- **Everything else is the fixer's, once.** When every report is in, one `haiku` fixer runs each touched package's full checks and its build once and repairs what fails. CI on the push is the backstop.

## Search what git tracks

- **Search with `rg`, `git grep` or the Grep tool.** All of them skip `node_modules`. A `grep -r` from a folder that holds one reads every installed package, piped into `grep -v node_modules` after the fact, and costs a minute of a core every call.
- **Read a large JSON with `node`, never with `grep -o`.** A data dump is often one line tens of megabytes long, and `grep -o` over it ran for over half an hour.

## Long runs

- **Read the memory gate first.** Before a test run, a build or a page, read the free memory (`(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB`) and wait while it is under about 4 GB. A machine that swaps slows every run more than one that waits.
- **Run a long CPU job at below-normal priority.** Use PowerShell `Start-Process … -PassThru` and then set `.PriorityClass = 'BelowNormal'`, or `start /belownormal`. The agents' checks and the page lane then keep their cores.
- **Decode a whole-video scan on the GPU, at a small size.** Pass `-hwaccel d3d11va` to use the GPU's video engine, and scale each frame down before any per-frame filter (`scale=64:-2` ahead of `signalstats`). A luma scan only needs one number per frame.
- **Sweep the orphans.** An agent that ends can leave its background processes running. The main session lists the processes whose parent is gone (a `grep`, an `ffmpeg`, a `tail -f` feeding a dead monitor) and stops them.

## Watch the machine

- **A watcher wakes the session, so nothing polls.** While agents or runners are working, the main session runs `.agents/skills/throughput/scripts/watch-machine.ps1` under the Monitor tool, re-armed at each expiry. It is silent while the machine is busy. It prints one line when the CPU has averaged under 80% for three minutes with more than 6 GB free, and one when free memory falls under the 4 GB gate. Either line repeats every 15 minutes while its state holds.
- **An idle line is a call to start what can run:** a lane's runner for a runnable item, a page per independent scene, the next wave's ready units.
- **A machine idle because nothing can run is correct.** That line is answered by saying so. No item is queued, and no unit invented, to fill the cores: a queue that only grows is never digested.
- **A tight line holds new starts** until memory comes back.

## Keep the GPU busy

- **The GPU is already the one doing the work.** Headless Edge gets the machine's own AMD RDNA 3 adapter by default, and the launch flags tried (`--use-angle=d3d11`, `--ignore-gpu-blocklist`, `--enable-unsafe-webgpu`) change nothing that matters: the last adds three features, and a launch forced onto SwiftShader gets no adapter at all. A bench's frame is set by the main thread instead: in a 475-mesh scene about nine of its twelve milliseconds a frame are main-thread work, so a low GPU share is that scene's draw loop, not a missing flag.
- **The page lane runs several scenes at once.** Its runner serves every item's page from its one parity server in its own worktree (port 3002), each item a page of its own by its screen query, for items whose measures read different scenes. Items reading the same scene stay in order.
- **One dev server and one browser serve every agent.** The shared checkout's parity page is served once on port 3011, and one shared Edge (`genshin:parity browser start`) takes every command as a context of its own, so a wave's commands share one server and one browser rather than each starting their own. Measured with three `film` commands at once, one server and one shared Edge peaked near 6 GB of private memory and ran about three cores on average, against near 8 GB and about five cores with three servers and three Edges, and the commands' processes fell from about 75 to about 45. The shared Edge stays up between commands, which the next wave's commands join at once.
- **A GPU idle while the queue holds items is a lane waiting on a miss.** A miss is a call only the main session makes, so it settles the misses before anything else: each holds the GPU.

## Tokens are a resource too

- **Haiku implements and opus settles the calls** (the `llm-delegation` skill). An opus agent stopped part way ends on a handoff spec. The main session lifts the spec out of the agent's transcript with a script into a file the next agent reads, never by reading the transcript itself.
- **The last tenth of a usage window belongs to the compute queue** (the usage reserve, in this skill's `SKILL.md`).
