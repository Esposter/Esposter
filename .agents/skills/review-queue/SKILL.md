---
name: review-queue
description: Apply when about to git commit or git push, when deciding what branch a commit lands on, when the collector has moved develop or rewritten ai/queue, when a CodeRabbit finding is being fixed in the session, when a collector run is red, or when the collector is switched off. Esposter's review queue — the session's side of the review collector: one permanent branch ai/queue, a unit committed by pathspec first, git pull --rebase only over a clean tree because the collector rewrites the queue onto each window and a rebase refuses a dirty one, a plain push after every pull and never a bare force-with-lease, a sweep's moves committed apart from its repairs, the Answers / Drains trailers, and the collector run by hand only with its workflow disabled.
---

# Review Queue

The session works on **one permanent branch, `ai/queue`**, and pushes it after every commit. The review collector — `pnpm ai:coderabbit:collect`, run by the `ReviewCollector` workflow on every queue push and every CodeRabbit event — drains open findings onto `ai/review-fixes`, **rewrites `ai/queue` onto the next window's base** (a conflict resolved by its own Claude session), cuts the largest window under the cap from the queue, fast-forwards `develop` by it, opens the `develop` → `main` pull request over whatever it then carries unreviewed, replies on every thread with the pushed sha, and merges the pull request once a review at the head leaves nothing open with the least merge risk. The mechanism is `apps/web/content/docs/infra/review-collector/`; this skill is what the session does.

## Settled — do not re-propose

- **Per-chunk feature branches.** Nothing gates entry to `develop` but the collector, so a branch per chunk only adds a merge that buys nothing; the queue is linear history, and a window is cut at commit boundaries.
- **Pushing `develop` by hand**, rate-limited or not. `develop` has one writer, the collector, and a hand push races its compare-and-swap and spends a review slot on a range nothing measured against the cap.
- **Measuring or cutting a window in the session** — reading the last reviewed sha, counting files since it, pushing a prefix by sha. The collector measures the cut on the tree it is about to push, one cherry-pick at a time; a commit that would have been "the last one under the cap" is just a commit.
- **Holding a finished chunk until `format`/`typecheck`/`lint`/tests come back.** A queue push spends nothing, and a repair found afterwards is one more commit behind the unit. Push the unit, run the checks in the background, commit the repairs.
- **Excluding files to bring a window under the cap.** The collector holds the overflow for the next window; an exclusion hides the work from the only review it will ever get.
- **Opening the release pull request by hand.** The collector opens it on the same pass that pushes the window, over the range it just measured; a session that opens one races that push, so the first review reads a range nothing cut to the cap.
- **Merging `main` or `develop` into `ai/queue`.** A merge is never linearised away — a rebase onto `origin/develop` is a no-op once `origin/develop` is an ancestor — and it blinds the porter: `git cherry` matches patch ids against the commits upstream has and the queue lacks, which a queue containing upstream leaves empty, so every already-ported commit reads as owed and the first one conflicts. The queue catches up by `git pull --rebase` only.
- **Rebasing `ai/queue` onto `origin/develop` or `origin/ai/review-fixes` by hand.** The collector rewrites the queue onto that tree itself after every window, with its own Claude resolving what conflicts (`apps/web/content/docs/infra/review-collector/collection-cycle.md`, "Sync"). A hand rebase races that rewrite — two rewrites of one ref, and a `--force-with-lease` whose lease is the fetched ref overwrites the collector's copy with nothing reporting it.
- **Merging the release pull request by hand when its review is clean.** The collector merges it the moment a review at the head leaves nothing open with the least merge risk; a person merges only one the bot rates riskier.

## The refs

Every ref has one writer, and the session's is `ai/queue` alone — its linear history, every unported commit in authoring order, no window cuts. The session never checks out `develop` for work, never touches `ai/review-fixes`, and never cuts a window; who writes the rest is `apps/web/content/docs/infra/review-collector/two-writers.md`.

## The loop

1. **Commit a unit on `ai/queue`, by pathspec, unless a rebase is in progress.** The base is stale by design (step 2 catches it up), so a commit never waits for a pull. Run the finishing checks in the background and commit their repairs as their own commit behind the unit — the collector cuts at commit boundaries, so every cut must be green on its own. A rebase another session left open (`git status` says so) is theirs to finish: nothing is committed into it.
2. **`git pull --rebase` before every push, and only over a clean tree.** The collector rewrites `origin/ai/queue` behind every window it ports — the ported commits gone, the rest re-parented onto the fixes — so the local branch is stale the moment a window goes out. The pull's fork-point finds where the local branch left the old remote head and replays only what every session committed since; the rewritten commits are never replayed. A rebase refuses a tree with unstaged changes, and in a shared checkout those are another session's work mid-edit — never stashed, never auto-stashed, never committed on their behalf. A dirty tree means the push waits: the commit stands locally and is pushed by whichever session next finds `git status` clean, since a queue push spends nothing and is owed no deadline. A conflict in the replay is between the sessions' own unpushed commits and the collector's fixes, the one kind only a session can settle — resolve it, `git rebase --continue`, and prove the result with `git diff <old head>`, which must show nothing but what the remote brought.
3. **`git push` after every pull, plain.** A push refused as non-fast-forward is the collector's rewrite landing since the pull: pull again, push again. **Never a bare `--force-with-lease`** — its lease is whatever the last fetch brought, so a local branch built on the rewrite's predecessor overwrites the rewrite with nothing reporting it; the only lease the session may push with names a sha it read and rebuilt on itself. A queue push spends nothing, so the standing rule that a push is asked for every time is `develop`'s — which the session never pushes.
4. **Keep working.** The collector fires on the push and does the rest; its replies name the pushed sha.

**Commit a sweep's moves apart from its repairs.** The collector's express lane sends a commit that provably has nothing to review — a folder sweep's moves and the imports that follow them — straight to `main`, out of queue order, so a sweep stops eating a budget counted in files. The proof is per commit, so a commit carrying the renames _and_ the refreshed size snapshot is one content change away from the lane.

## Answering a finding in-session

A finding the session fixes itself is a commit on `ai/queue` carrying the trailer `Answers: <comment id>` (a body-only finding: `Drains: <review id>`). The collector's open-finding predicate honours a trailer on the queue's unported commits, so it neither re-fixes the finding nor replies before the commit is on `develop`. It ports in queue order, not first — only `ai/review-fixes` commits lead a window — so the wait is the cost of answering in-session rather than leaving the drain to it. A rejection needs no sha and may be replied to directly; the reply's shape is the `coderabbit` skill's.

**When the collector's run fails red naming a held commit** — the queue's first owed commit overflows the cap alone, or its conflict with the tree the fixes built survived the resolver's attempt cap (the run's log names which) — the queue is the session's to repair, and every run stays red until it is. A commit over the cap alone is split. A conflict past the cap is the one hand rebase the Settled list allows: `git pull --rebase` first, then `git rebase origin/ai/review-fixes` — the fixes lead the next window, and the porter reads what the queue owes against the tree they built — resolved commit by commit, and pushed with a lease naming the sha the pull brought (`--force-with-lease=refs/heads/ai/queue:<that sha>`), never bare.

## After a release merges

Nothing is owed by the session: `develop` follows `main` by the collector's return stroke, the queue keeps filling from the new merge base, and the collector's next sync drops the ported commits from the queue. **Never merge `main` or `develop` into `ai/queue`** (Settled). A merge that got in is undone by `git rebase --force-rebase origin/develop`, which replays the queue's own commits and drops the ported ones as empty; conflicts are resolved commit by commit, `git diff <old head>` afterwards proves the tree unchanged but for what `main` brought, and the push carries a lease naming the sha the last pull brought.

## Deep Dives

- `references/running-by-hand.md` — when the collector's workflow is off and the cycle is run from a checkout.
