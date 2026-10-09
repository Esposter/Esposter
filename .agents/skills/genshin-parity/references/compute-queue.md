# The Compute Queue

Read when a solve, fit, calibration, render, `compare` or any other long run is owed and no judgement is left in it, or when picking one up.

A build writes the script; the run waits in the queue. A queue item is work whose every call is already made, so it is a `haiku` runner's: the main session decides what is owed and what a result means, never waits on the run itself. The flow around it is `apps/web/content/docs/architecture/agent-batches.md`.

## An item

One line under the roadmap's **Compute queue** (`apps/web/content/docs/genshin/roadmap.md`), carrying everything a runner needs and nothing it must decide:

- its lane, `[page]` or `[cpu]` (see **The lanes** on this page), first;
- its id in braces, a short kebab slug of what it does, which is the entry's name in the fleet's claims (`pnpm ai:fleet:hold <id>`);
- its needs after `needs`, the capabilities a machine must hold to take it: `game-install` when the item reads the installed game (an extraction does), `game-exports` when it reads `~/Esposter/genshin-parity` exports, `parity-page` for every `[page]` item. An item with no needs is taken by any machine;
- the exact command, from the repo root, with every argument;
- what it reads, paths outside the repo named (`~/Esposter/genshin-parity/...`);
- what it writes: its touch set, which no live claim on another entry may overlap;
- the measure that says it worked, with its bar.

The line is the item's whole record in the queue: `- [ ] `[cpu]` {id} needs <capabilities> — **Title.** …`. A machine takes an item only when its profile meets the needs, its area is lent and no live claim holds it or its paths (`pnpm ai:fleet:next`, the `throughput` skill's `references/fleet.md`).

An item missing any of these is not queued: the gap is a call, and calls are the main session's. Items stand in the recreation passes' order, so the queue reads top to bottom. An item waits on the earlier passes **its measure reads**, not on every earlier pass: a sun solved on the exports' shadow edges reads the shape and the camera, so it runs while the surface is still red, and a light pass that scores our stone's colour does not. Releasing an item past a red pass is the main session's call, made by naming what its measure reads.

**The queue holds only what can be digested.** Every item in it can run now, or once an item above it has run. An item whose input does not exist yet sits under the queue's own **Waiting** heading and names its blocker: a recording on the Recordings owed list, or a fix in progress. No runner takes one, and it moves up when its input lands. A missed item keeps its claim, its miss written into the claim, and no runner retakes it: a missed claim is never taken over as stale, so the main session's call alone changes that item. A queue that only grows is a queue nothing can finish.

## The lanes

- **`[page]`** covers anything that drives the parity page: `compare`, `rank`, `film`, `listen`, `calibrate` and every witness command.
  - It renders on the GPU, and an edit to world or engine source reloads the page and kills every run on it.
  - So the lane has **one runner**, working in **one runner worktree**: `~/Esposter/wt/runner`, cut from `origin/ai/queue`, installed once and reused, and fast-forwarded between items. Its parity page is served from that worktree on port 3002 (`pnpm -C packages/genshin-world parity`), and each of its `genshin:parity` commands sets `GENSHIN_PARITY_PORT=3002`, since the default names the shared checkout's page.
  - A batch's edits in the shared checkout never touch it.
- **A screen being built** is not a queue item: a `haiku` agent bringing a 2D screen to the game's likeness runs its edit-and-compare loop in the bench, the worktree of its own the bench section describes, so the loop never waits on the queue. The shared checkout's parity page, which the main session serves once for the wave on port 3011, takes a lone comparison outside a loop: a 2D comparison takes seconds, so a reload from another agent's edit costs one retry. A run of more than a couple of minutes, such as a solve, a fit over the page or a full `passes`, is never run on the shared page: every edit to world or engine source reloads it, and one 12-minute shadow solve was killed four times that way. Such a run becomes a `[page]` item for the runner's own worktree, and the agent that wrote the code ends its unit with the item queued. Even a short edit-and-compare loop needs a page that loads, and a code wave's half-written files in the shared checkout keep it from loading: the Windrise oak lost seven runs to a stats wave. So a scene or screen loop runs in **the bench** instead, a second worktree beside the runner's, where no wave edits.

## The bench

- **Each worktree names its own page.** `GENSHIN_PARITY_PORT` defaults to the shared checkout's server on 3011, which serves that checkout's uncommitted edits, so the runner always sets 3002 and each bench its own port, 3020 or 3021. A runner that forgets measures someone's half-written file.
- **What it is:** `~/Esposter/wt/bench`, cut from `origin/ai/queue`, installed once and reused. Its packages are built in dependency order through `bash .agents/skills/throughput/scripts/build-cached.sh` (`configuration`, `shared`, `pitch-transcription`, which the scripts load, then `genshin-text`, `genshin-engine`, `genshin-interface` and `genshin-world`), so a commit another lane already built restores each `dist` instead of rebuilding it.
- **Two benches.** `~/Esposter/wt/bench` (page on 3020, lock `~/Esposter/wt/bench.lock`) takes scene loops, and `~/Esposter/wt/bench2` (page on 3021, lock `~/Esposter/wt/bench2.lock`) takes screen loops. The same scene or screen never runs on both at once.
- **One loop at a time on each bench.** A loop takes its bench by writing its label to that bench's lock, `~/Esposter/wt/bench.lock` or `~/Esposter/wt/bench2.lock`, and removes the lock when it ends. Another loop on the same bench waits for its lock.
- **Setup, once per bench:** `git worktree add --detach ~/Esposter/wt/bench origin/ai/queue` (or `~/Esposter/wt/bench2`), then in it the narrow two-install setup of a lane that runs no app, as `throughput`'s `references/fleet.md` gives it with its filters and its measurement.
- **Starting:** with the bench clean, `git fetch origin ai/queue` and `git checkout --detach origin/ai/queue` in it, then rebuild a package whose module files changed. Its page is served from the bench on its own port, `GENSHIN_PARITY_PORT` set to 3020 or 3021, started and stopped by the loop.
- **Landing:** commit in the bench, then `git fetch origin ai/queue && git rebase origin/ai/queue && git push origin HEAD:ai/queue` there. The push is plain; a refusal means the remote moved, so fetch, rebase and push again. The shared checkout takes the commits on its next `pnpm ai:queue:push` sync.
- **Off an approved screen, a change lands when it improves what it targets and turns nothing red.** A figure that held must still hold. A figure already failing may move either way, and the move is recorded on the page. The Windrise oak's canopy fit cut its outline from 63.5 to 11.7 px and let the ground's normal hold, while its depth, failing twentyfold, moved 0.189 to 0.212: it lands.
- **No mixed result on an approved screen.** A loop lands a change that moves an approved visual image only when every gated figure it moves improves. Only the user approves images, so a change that lifts one figure and worsens another, like the walkway glow's colour against its structure, is recorded as tried in the scene's reference file and not landed.
- **Ending:** the bench is left clean, its page stopped, and the lock removed.
- **`[cpu]`** covers fits, solves, extraction and sampling that read files and need no page. They run in **their own worktree**, `~/Esposter/wt/cpu`, built like the bench's and fast-forwarded to `origin/ai/queue` between items, as many at once as the cores and the memory gate allow (**Keeping it busy**). The scripts load the packages' `dist`, and a code wave in the shared checkout leaves that `dist` missing exports mid-edit: two region extractions failed at startup that way. The lane commits there and lands as the bench does, by fetch, a rebase of only its own commits, and a plain push.

**A rewritten snapshot is committed by whoever ran the command.** `compare`, `passes` and their kin rewrite committed snapshot files as they measure. The agent or runner that ran one commits what it wrote in the same unit, or restores the file when the run does not count. An orphaned snapshot edit blocks every sync of the shared checkout until someone claims it.

## Running one

1. **Claim it.** Run `pnpm ai:fleet:next --lane <lane>`, where `<lane>` is your runner's lane. It prints `claimed <id> as worker <worker>`, and that worker id is yours for the item. Start `pnpm ai:fleet:hold <id> --worker <worker>` in the background for it. The claim is a ref on origin, not a commit on `ai/queue`, and the hold renews it every ten minutes until the release below.
2. **Check the memory first.** If free physical memory is under an eighth of the machine's RAM, about 4 GB here (read off `Get-CimInstance Win32_OperatingSystem`, in kilobytes), wait for a run to end before starting another. Thrashing slows every run more than waiting does.
3. **Run it in the background.** The runner reads its output when it ends, never with a foreground wait.
4. **If the measure meets its bar,** commit what the command wrote (data, a report row) and delete the item's line from the queue in the same commit. The roadmap holds open work only. The items running at once share their lane's worktree and its index, so the commit is by pathspec, naming only this item's outputs and the roadmap, never `git add -A` or `git commit -a`, or it carries another item's half-written output. Then `pnpm ai:fleet:release <id> --worker <worker>` deletes the claim, and that worker's hold ends.
5. **If the measure misses,** commit nothing and change no parameter. Run `pnpm ai:fleet:release <id> --worker <worker> --miss "<number>"` with the number, which keeps the claim as the miss, and report it. A miss is a call for the main session, never a second run with a guessed value.
6. **Start the next runnable item of the lane** whenever the memory gate leaves room, beside the ones still running, until none is left. Then report and end.

## Keeping it busy

The queue is never left idle while it holds items.

- **Who starts runners:** the main session starts a runner for each lane with work as soon as an item lands.
- **How many:** each lane has one runner, and the runner runs several items at once, each in the background. The `[page]` lane runs its items' pages on its one server, each item a page of its own by its screen query, for items whose measures read different scenes. Items reading the same scene stay in order. The `[cpu]` lane runs as many items as the cores and the memory gate allow, each at below-normal priority.
- **When it ends:** a runner ends when no item of its lane can run. It never waits for one to become runnable, and the main session starts it again when one does.
- **Nothing schedules it:** a runner loops through its lane by itself (step 6).
