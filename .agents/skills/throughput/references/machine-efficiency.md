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

## Keep the GPU busy

- **The page lane runs several scenes at once.** Its runner serves one parity page per item from its own worktree, on its own port (3003 upward), for items whose measures read different scenes. Items reading the same scene stay in order.
- **Each screen agent serves its own page** on its own port (3011 upward), so a 2D comparison never waits on the lane.
- **A GPU idle while the queue holds items is a lane waiting on a miss.** A miss is a call only the main session makes, so it settles the misses before anything else: each holds the GPU.

## Tokens are a resource too

- **Haiku implements and opus settles the calls** (the `llm-delegation` skill). An opus agent stopped part way ends on a handoff spec. The main session lifts the spec out of the agent's transcript with a script into a file the next agent reads, never by reading the transcript itself.
- **The last tenth of a usage window belongs to the compute queue** (the usage reserve, in this skill's `SKILL.md`).
