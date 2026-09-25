---
title: Realign
description: When a hand repair lands on main or develop outside the collector and the queue's three-dot diff balloons with changes the base already holds, the queue is rebased onto develop on request — each conflict settled to the queue's side, the tree proved identical to the old tip, and the push leased on the sha it replaced.
---

# Realign

The collector rewrites `ai/queue` onto each window's base itself ([sync](/docs/infra/review-collector/collection-cycle)), so a session never rebases the queue on its own initiative. One situation falls between windows: a person repairs `main` by hand — a red CI fixed in one commit that also carries a queue commit's content — and folds `main` into `develop`. Until the next window, the queue's diff against `develop` (`git diff origin/develop...origin/ai/queue`) is measured from the old merge base, so it counts every file the repair already brought across, and a pass meant to be small reads as hundreds of files owed. A realign moves the merge base forward so that the diff shows only what the queue still owes. It runs **when the user asks for it**, never as a side effect of a push.

A request to send one queue commit **straight to `main`** comes first, because the repair has often carried it already. Cherry-pick the commit onto `origin/main` in a scratch worktree and settle each conflict to `main`'s side. If the pick comes out empty, `main` already holds the commit and nothing is pushed. If it does not, the route is the [express lane](/docs/infra/review-collector/express-lane) (an `Express:` trailer), never a hand push to `main`.

## The recipe

```mermaid
flowchart TD
  A[User asks to realign] --> B{Tree clean and<br/>no rebase in progress}
  B -->|no| W[Wait — the dirt is another session's]
  B -->|yes| C[Record the old tip<br/>git rev-parse origin/ai/queue]
  C --> D[git rebase origin/develop]
  D --> E{Conflict}
  E -->|yes| F[Take the queue commit's side<br/>git checkout --theirs, add, continue]
  F --> G{Commit now empty}
  G -->|yes| S[git rebase --skip<br/>the base already holds it]
  G -->|no| D2[Continue]
  S --> E
  D2 --> E
  E -->|done| H[git diff old-tip HEAD]
  H --> I{Differs}
  I -->|only files the base brought<br/>and the queue already covers| J[One fix commit restoring<br/>the old tip's version of each]
  I -->|a real change the base made| K[Keep it — the base is newer]
  I -->|nothing| L
  J --> L[Push with a lease on the old tip<br/>--force-with-lease=ai/queue:old-sha]
  K --> L
  L --> M[Re-measure<br/>git diff --shortstat origin/develop...origin/ai/queue]
  M --> N{origin/ai/review-fixes<br/>an ancestor of origin/develop}
  N -->|yes| Z[Done — no fix is pending]
  N -->|no| R[Rebase ai/review-fixes onto develop<br/>the review-queue skill's held-fix recipe]
```

The hand repair moved `develop` too, so the last check is `ai/review-fixes`. If `git merge-base --is-ancestor origin/ai/review-fixes origin/develop` succeeds, every fix is already on `develop` and the next drain starts from it. A fix left off `develop` is rebased onto it commit by commit, the way the `review-queue` skill repairs a fix whose replay failed.

- **Conflicts take the queue's side.** The base already holds a copy of what the conflicting commit was converging on, and the queue commit being replayed is the newer word on it, so `--theirs` (inside a rebase, the commit being applied) is what the old tip held. A commit left empty by that choice is one the base already carries, and is skipped.
- **The proof is a tree diff against the old tip.** It should be empty but for what the base brought. Where the base brought something the queue had already answered some other way — a declaration duplicated in a file of its own, a generic added for a caller the queue removed — one fix commit restores the old tip's version of those paths, so the queue's history stays on top of the base and its tree stays exactly what it was.
- **The push names the sha it replaced.** `--force-with-lease=ai/queue:<old tip>` refuses the push if the collector or another session has moved the queue since, which is the race the Settled rule against hand rebases exists to prevent. A bare `--force-with-lease` would take the last fetch as its lease and overwrite that move without saying so.

## Key files

| File                                      | Role                                                                   |
| :---------------------------------------- | :--------------------------------------------------------------------- |
| `.agents/skills/review-queue/SKILL.md`    | the session's loop, and the Settled rule this page is the exception to |
| `scripts/src/services/coderabbit/collect` | the sync that realigns the queue on its own after every window         |
