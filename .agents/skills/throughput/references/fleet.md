# The Fleet — Any Number of Machines, One Queue

Read when more than one machine works the backlog: when a machine joins, when one goes idle, when work is claimed, synced or pushed, when game data has to reach a machine, and when the fleet's load is read.

The fleet has no fixed size. One PC, a lent MacBook, or hundreds of machines all follow the same rules. So no rule may cost the coordinator anything per machine: no assignment by message, no report read per machine, no machine named in a rule. The architecture page, with the diagram and the fleet's current machines, is `apps/web/content/docs/architecture/fleet.md`.

## A machine

- **A machine is a checkout of its own with one main Claude session on it.** Its session fans work out to its own `haiku` agents, as many as its watcher's idle lines allow.
- **Its profile is `~/.esposter/machine.json`:**
  - `id`;
  - `areas`, the areas the user lent it for (the MacBook's is `["genshin"]`, and `["*"]` is everything);
  - `capabilities`: its OS, plus `game-install`, `game-exports`, `parity-page` and `media-engine` as it holds them.

  `pnpm ai:fleet:profile` writes what it detects and keeps what the user set.

- **An area the user did not lend is never worked**, however idle the machine is.

## The queue is pulled, never pushed

- **Work is an entry with an id and its needs:** a compute-queue item on the roadmap, or an open proposal unit. An entry names what it writes, which is also its touch set.
- **A proposal unit carries the same three fields a queue item does, in its frontmatter** (the `docs` skill, `references/page-frontmatter.md`), each optional:
  - `needs: [<capability>, ...]`, the same vocabulary as a queue item's needs;
  - `waiting: "<blocker>"`, set while the unit cannot be built yet, such as on another unit or on data that is not extracted; a waiting unit is never offered, and `pnpm ai:fleet:status` lists it with its blocker;
  - `touches: [<glob>, ...]`, added to its Key files paths. A glob names the directory it opens in, so `dir/*` and `dir/**` both overlap anything under `dir`. It is cut at its first wildcard, so a glob names whole folders: `Forge*/**` names a `Forge` folder and misses the sibling "ForgeScreen". A long list may wrap over the lines below its key, as the formatter writes it.
- **An idle machine takes its own next entry.** When its watcher prints an idle line, its session runs `pnpm ai:fleet:next --lane <lane>`, its lane as the runner names it. That returns, and claims, the first entry that meets all of these:
  - its needs are within the machine's capabilities;
  - its area is lent;
  - it is not waiting on a blocker;
  - no one holds it;
  - its touch set overlaps no held claim's.

  Nothing ready means the machine stays idle and says nothing.

- **A lane's worktree is `~/Esposter/wt/<lane>`**, the same path on every machine and in every session (`runner`, `bench`, `bench2`, `cpu`, `perf`, `ci`). A one-off worktree is `~/Esposter/wt/<name>` and is removed with `remove-worktree.sh` when done. The short root keeps `node_modules/.pnpm` under Windows' 260-character limit, which a scratchpad path does not.
- **A fresh worktree is set up in two installs, never one.** `pnpm i --frozen-lockfile` leaves the workspace state without the `autoDedupe` setting, which `verifyDepsBeforeRun: error` rejects as "changed"; the `pnpm i --offline` that follows records it, and runs no network resolve, so the lockfile stays as committed. In a worktree: `pnpm i --frozen-lockfile && pnpm i --offline`.
- **The coordinator writes entries and settles calls.** It never assigns work by message and never waits on a machine's report, so the fleet grows without its cost growing.

## A claim is a ref

- **Claiming creates `refs/claims/<entry-id>` on origin, by pushing a parentless commit.** Git refuses the second create as not a fast-forward, so exactly one worker wins. There is no lock service, and two different entries never contend.
- **A claim belongs to one worker; a machine runs many.** A holder is `{ machine, worker }`. `pnpm ai:fleet:next` prints the worker id it claimed under (`claimed <id> as worker <worker>`), taken from `FLEET_WORKER` or a new short id when the environment gives none. `hold` and `release` take that id as `--worker`, or read it from `FLEET_WORKER`. A worker adopts only a claim that matches both fields, so another worker on the same machine counts as holding the entry, and `next` moves on. A release stops only its own worker's hold, whose file is `~/.esposter/holds/<id>.<worker>.pid`. A claim written before workers reads as worker `""`.
- **The holder renews it every ten minutes** with an explicit `--force-with-lease=refs/claims/<id>:<its sha>`, and the renewal's message carries its latest utilization line.
- **A claim unrenewed for thirty minutes is stale.** It is taken over the same way, leased from the stale sha.
- **Finishing deletes the ref** right after the entry's landing commit is pushed. A missed entry keeps its claim ref, its message naming the miss, until the coordinator's call changes the entry.
- **A claim never touches `ai/queue`**, so it starts no CI run. The old claim, a `— running` line committed and pushed, cost a commit, a push and a CI run each.

## Load is read, not reported

- **Each machine runs `pnpm ai:machine:watch` under Monitor.** It is the same command on every OS, and it pushes `refs/machines/<id>` every ten minutes with the machine's CPU, GPU, free memory and platform.
- **`pnpm ai:fleet:status` is the coordinator's whole view:** every machine's last sample, and every claim with its holder and age.
- **A machine messages the coordinator only for a miss, a failure, or a call it cannot make.** Its idle lines are its own signal to claim.

## Sync

- **A machine's own checkout** runs `git pull --rebase` before each entry and before each push. It pushes through `pnpm ai:queue:push` after each coherent chunk, never once at the end of a long entry. With many machines a push loses its race routinely, and the script retries with jittered backoff.
- **A shared checkout**, the one a machine's agents all edit, is always dirty, so it never pulls. Its session runs `pnpm ai:queue:push` after every agent report. The script replays the session commits onto origin in a throwaway worktree, pushes, and moves the checkout's branch when no dirty file conflicts.
- **A replay merges text, not meaning.** A change to a shared signature is typechecked once more after the rebase onto origin, right before its push, so callers another machine added meanwhile are migrated too. On 2026-10-09, `getTalentMultiplier` gained a parameter on the PC while the MacBook added seven kits calling it the old way. Both replays were clean, and 12 test files broke.
- **Never stash, never `git add -A`, never a bare `--force-with-lease`**, on any machine (the `review-queue` skill).

## Game data stays on the machines that hold it

- **Exports and recordings never travel through git, GitHub, a cloud drive or a Claude channel.**
- **A machine gets the game itself.** It downloads the game from HoYoverse's official CDN (an open-source Sophon downloader where no launcher runs) and runs the `genshin:assets` extraction locally. That route needs no other machine, works on or off the LAN, and spreads the extraction, the heaviest CPU load, across the fleet. The `shaders` step needs Windows' `d3dcompiler_47`, so it stays on a Windows machine.
- **`pnpm ai:fleet:data` is the faster copy between LAN machines whose owner allows SSH.** A peer's public key goes in the receiver's `authorized_keys`, which is the owner's call per machine, never assumed. It copies only what the local manifest lacks, as one tar stream over SSH.
- **Each machine's `GENSHIN_PARITY_DIRECTORY` is `~/Esposter/genshin-parity`.** `frames` and `tmp` are rebuilt where they are used, never copied.
- **A machine holds `game-install` and `game-exports` only once it has them**, and takes only the entries its capabilities meet until then.
