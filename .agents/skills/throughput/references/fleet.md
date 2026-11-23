# The Fleet — Any Number of Machines, One Queue

Read when more than one machine works the backlog: when a machine joins, when one goes idle, when work is claimed, synced or pushed, and when the fleet's load is read.

The fleet has no fixed size. One PC, a lent MacBook, or hundreds of machines all follow the same rules. So no rule may cost the coordinator anything per machine: no assignment by message, no report read per machine, no machine named in a rule. The architecture page, with the diagram and the fleet's current machines, is `openspec/specs/architecture/fleet/design.md`.

## A machine

- **A machine is a checkout of its own with one main Claude session on it.** Its session fans work out to its own `haiku` agents, each taking an entry it claims with `pnpm ai:fleet:next`.
- **Its profile is the one `pnpm ai:fleet:profile` writes:**
  - `id`;
  - `areas`, the areas the user lent it for (`["genshin"]` lends one area, and `["*"]` is everything);
  - `capabilities`: its OS, plus `game-install`, `game-exports`, `parity-page` and `media-engine` as it holds them.

  `pnpm ai:fleet:profile` writes what it detects and keeps what the user set.

- **An area the user did not lend is never worked**, however idle the machine is.

## The queue is pulled, never pushed

- **Work is an entry with an id and its needs:** a compute-queue item on its area's design under `openspec/specs/genshin/compute/`, or an open change. An entry names what it writes, which is also its touch set.
- **A change carries the same three fields a queue item does, in its `.openspec.yaml`** (the `openspec` skill, `references/change-metadata.md`), each optional:
  - `x-needs: [<capability>, ...]`, the same vocabulary as a queue item's needs;
  - `x-waiting: "<blocker>"`, set as the `openspec` skill, `references/change-metadata.md` gives it, such as on another unit or on data that is not extracted; a waiting change is not offered at all, its unblocked tasks included, and `pnpm ai:fleet:status` lists it with its blocker;
  - `x-touches: [<glob>, ...]`, added to its Key files paths. A glob names the directory it opens in, so `dir/*` and `dir/**` both overlap anything under `dir`. It is cut at the last slash before its first wildcard, so a glob names whole folders: `Forge/*` and `Forge/**` both name `Forge`, while `Forge*/**` has no slash before its wildcard and names the repository root, which overlaps every entry. A long list may wrap over the lines below its key, as the formatter writes it.
- **A unit's phase is read off its change's open tasks**, the lowest phase among them, as the `openspec` skill's `references/change-metadata.md` sets out.
- **A machine takes its own next entry.** Its session runs `pnpm ai:fleet:next --lane <lane>`, its lane as the runner names it. That returns, and claims, the first entry that meets all of these, in the order below:
  - its needs are within the machine's capabilities;
  - its area is lent;
  - it is not waiting on a blocker;
  - no one holds it;
  - its touch set overlaps no held claim's.

  Entries are taken in the pick order the fleet design (`openspec/specs/architecture/fleet/design.md`) sets out. A phase none of whose entries meets these conditions is passed over, so the next phase's first entry is claimed.

  Nothing ready means the machine stays idle and says nothing.

- **A compute run goes to the machine that meets its needs; judgement stays in the session that holds its context.** A run that costs much compute and few tokens is an entry, so the first machine with the cores, GPU or game install it needs takes it. A design call or a reverse-engineering read is token-heavy and stays in the main session of the machine that holds its context; it is never queued to another machine.

- **A lane's worktree is `.agents/worktrees/<lane>`, on a branch named `<lane>`**, the same path on every machine and in every session (`runner`, `bench`, `bench2`, `cpu`, `perf`, `ci`). A one-off worktree is `.agents/worktrees/<name>` on a branch named `<name>` (the `review-queue` skill), and `pnpm ai:worktree:remove` removes it and its branch when done. It takes the worktree's full path only; a relative one is refused, since it would resolve against the working directory and remove a different worktree from each. Long paths are enabled once on Windows (`pnpm ai:setup` checks it; `openspec/specs/architecture/monorepo-tooling/design.md`, "Dependency installs"). A lane's logs live inside its own worktree, so `pnpm ai:worktree:remove` takes them with it; never beside it in `.agents/worktrees/`, where stray logs from finished lanes would pile up.
- **A fresh worktree installs once, in full, before anything else runs.** `pnpm i --prefer-offline` links the whole workspace from the machine's global virtual store (`openspec/specs/architecture/monorepo-tooling/design.md`) and runs the app's `nuxt prepare`, which writes the worktree's own `.nuxt` types. A frozen install is not used: `autoDedupe` leaves it looking outdated, so the first `pnpm` or `vp run` after it installs the workspace again, inside whatever task started it, and the task cache records that install's links as the task's output. The install may move the nightly aliases to their newest build: the moved lockfile is committed as its own `chore(deps)`, as the `resuming` skill says.
- **A worktree is made with `pnpm ai:worktree:create <name> [package...]`.** It creates the branch on `ai/queue`, writes every workspace package's barrels from its own source and manifest, installs the workspace under the machine's install lock, seeds its task cache from a sibling worktree, and builds the packages the scripts package and the packages named depend on, in dependency order. A fresh worktree carries its barrels, so a package nobody builds still has its `src/index.ts` and a citation of it resolves. It prints one stderr line per phase with its seconds and the worktree's full path on stdout, or exits 4 creating nothing while the memory gate is shut. The steps and the seeding rule are the `build-pipeline` design's (`openspec/specs/architecture/build-pipeline/design.md`).
- **Every lane sets up the same way, whether or not it runs the app.** The one install above, then its dists with `vp run build:packages`, a cold build of the set costing minutes once.
- **Its packages are built with vp's task runner, in dependency order.** `vp run build:packages` builds every package, each as its own task after the packages it depends on, so no list of packages is kept to drift. A package whose inputs are unchanged replays its `dist` from the task cache, which a create seeds from a sibling worktree and never from the main checkout (`openspec/specs/architecture/build-pipeline/design.md`). A create and its builds run at default QoS, as the rule in `openspec/specs/architecture/machine-efficiency/design.md`, "How the work runs", sets out. The `build` skill owns the task.
- **The coordinator writes entries and settles calls.** It never assigns work by message and never waits on a machine's report, so the fleet grows without its cost growing.

## A claim is a ref

The ref's lifecycle — renewal, staleness, release — is the Claims section of `openspec/specs/architecture/fleet/design.md`. This page is the commands and the code that carry it.

- **Claiming creates `refs/claims/<entry-id>` on origin, by pushing a parentless commit.** Git refuses the second create as not a fast-forward, so exactly one worker wins. There is no lock service, and two different entries never contend.
- **A claim belongs to one worker; a machine runs many.** A holder is `{ machine, worker }`. `pnpm ai:fleet:next` prints the worker id it claimed under (`claimed <id> as worker <worker>`), taken from `FLEET_WORKER` or a new short id when the environment gives none. `hold` and `release` take that id as `--worker`, or read it from `FLEET_WORKER`. A worker adopts only a claim that matches both fields, so another worker on the same machine counts as holding the entry, and `next` moves on. A release stops only its own worker's hold, whose file is named by its id and worker. A claim written before workers reads as worker `""`.
- **The holder renews it every `RENEW_MILLISECONDS`** (`scripts/src/services/fleet/constants.ts`) with an explicit `--force-with-lease=refs/claims/<id>:<its sha>`, and the renewal's message carries its latest utilization line. Every call to origin's fleet refs goes through `runFleetRefGit`, bounded as `openspec/specs/architecture/fleet/design.md`'s Claims section sets out, so a stalled network fails a renewal rather than freezing the hold. A new call to a fleet ref takes the same runner, never a bare `runGit`.
- **A claim never touches `ai/queue`**, so it starts no CI run.

## Load is read, not reported

- **Each machine's watcher (`pnpm ai:machine:watch`, "Watch the machine" in `references/machine-efficiency.md`) pushes `refs/machines/<id>` every `RENEW_MILLISECONDS`** with the machine's CPU, GPU, free memory and platform. A heartbeat push that stalls is killed at the same bound as a renewal and tried again at the next interval.
- **`pnpm ai:fleet:status` is the coordinator's whole view:** every machine's last sample, and every claim with its holder and age.
- **A machine messages the coordinator only for a miss, a failure, or a call it cannot make.**

## Sync

- **A machine's main checkout** only fast-forwards with `git pull --rebase` before each entry, and an agent never edits it. Each agent lands its own commits from its worktree with the `review-queue` skill's loop. With many machines a push loses its race routinely, so the loop retries a rejected push.
- **Each agent's worktree** is its own checkout, set up and removed by the agent (the `review-queue` skill), so no checkout is ever shared between agents.
- **A checkout syncs on the events that move `ai/queue`, never on a timer** (the `review-queue` skill's push rule; the timer half is the `no-polling` spec's, `openspec/specs/architecture/no-polling/spec.md`, requirement "The review queue is not drained on a timer"). Each machine's heartbeat carries the last commit its git identity landed on the queue, read off git, so the `pushed` column of `pnpm ai:fleet:status` is how a machine sees another's progress, with no message needed.
- **A rebase merges text, not meaning.** A change to a shared signature is typechecked once more after the rebase onto origin, right before its push, so callers another machine added meanwhile are migrated too. When a shared signature gains a parameter, another machine can land callers of the old form in the same window; both rebases can be clean while the tests break.
- **The `git` skill's rules hold on every machine**, the queue's own included (the `review-queue` skill).
