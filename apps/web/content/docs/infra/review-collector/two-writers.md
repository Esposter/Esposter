---
title: Two writers
description: The ref ownership that lets a working session and the review collector share one pull request without racing: the collector writes develop and review-fixes, the session writes queue.
---

# Two Writers

Two actors work the release pull request — the working session and the collector — and two writers on one ref would be a race whatever the gates say. The rule is not a lock but ownership — every ref in the pipeline has exactly one writer, and the two actors communicate only through the refs the other one reads.

| Ref            | Written by                                | Read by          | Moves how                                                                                         |
| :------------- | :---------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------ |
| `develop`      | the collector                             | both, CodeRabbit | fast-forward only, one window per review cycle                                                    |
| `review-fixes` | the collector                             | the session      | grows during a drain, re-created from `develop` by the next one once ported — never deleted       |
| `queue`        | the working session                       | the collector    | the session's checked-out branch, pushed after every commit                                       |
| `main`         | a person merging the release pull request | everyone         | `develop` follows it by fast-forward on the merge, and a bump landing there rides the next window |

The standing authorisation the session holds is to push `queue`, which spends nothing: a queue push starts no review, only a collector run that measures. The four gates of the `coderabbit` skill live in the [collection cycle](/docs/infra/review-collector/collection-cycle), where they are read from the remote every time rather than remembered in a session's head.

## The session's loop

```mermaid
sequenceDiagram
  participant S as Session on queue
  participant Q as origin/queue
  participant C as Collector
  participant D as origin/develop
  S->>S: commit a unit
  S->>Q: git push
  Q-->>C: push event — gates, maybe a window
  C->>D: fast-forward develop by the window
  S->>S: fetch, rebase queue onto origin/develop
  Note over S: ported commits drop by patch id, the rest re-parent
  S->>Q: git push --force-with-lease
```

The session's checked-out branch is `queue`, not `develop`. It commits coherent units there, with two habits:

- **After every commit, push.** A plain `git push` while the queue sits on `develop`'s head, which is the common case after a fast-forward. The queue is the session's history and nothing more — a backup of unpushed work, not a reviewed artifact, exactly as the numbered bookmarks were — so rewriting it after a rebase is by design, and `--force-with-lease` is what makes two sessions on two machines safe: the second push fails instead of dropping the first's commits, and the loser fetches, rebases and pushes again.
- **Before every unit, sync.** `git fetch` and, when `origin/develop` moved, `git rebase origin/develop`. When the collector fast-forwarded, the session's commits are already ancestors and the rebase is a no-op. When it cherry-picked — fixes led the window, or the queue had drifted — the ported commits are equal by patch id and the rebase drops them, re-parenting the unported rest onto the new head. Either way `queue` is again a strict extension of `develop`, and the next push says so.

The session never checks out `develop` for work, never pushes it, never touches `review-fixes`, and never cuts a window: a commit that would have been "the last one under the cap" is just a commit, because the collector measures the cut on the tree it is about to push. `develop` is what `main` already is — a branch read for its head and written by one process.

## When the session wants to answer findings itself

It may. A finding fixed in the session is a commit on the local branch carrying the same `Answers: <comment id>` trailer the collector writes, and it rides to `queue` with everything else. The collector's open-finding predicate honours a trailer on the queue's unported commits, so it will not fix the same finding twice, and its reply step names the commit once it is on `develop`. What the session must not do is reply to the thread itself before the push — the skill's rule that a reply cites a sha the remote has holds for both writers, and the collector is the one that knows when the push happened.

A rejection needs no sha, so a session may post one directly. The collector treats a thread whose last comment is not the bot's as answered.

## When the collector's fixes conflict with the queue

The drain changed a file the queue's next commit also changed, so the port stops before that commit and reports it. Only the session can decide how the two combine, and it does so by rebasing `queue` onto `origin/review-fixes` rather than onto `develop`: the fixes are not on `develop` yet, and they will lead the next window, so a queue that already contains them — equal by patch id, replayed as empty by the porter and skipped — is a queue that no longer conflicts. `review-fixes` is safe to rebase onto because the collector never rewrites it while it owes commits; it only grows until ported, and its re-creation after that changes nothing for the session, whose copies of those commits are the ones that ride.

## Parallel work

Worktree agents executing specs commit on their own branches and hand the result to the main session, which merges it into its local `queue` and publishes it. There is still one writer of `queue` per machine, and the lease handles the case of two machines. A worktree agent never pushes `queue` itself.

## Key files

| File                                                         | Role                                                                                  |
| :----------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| `.agents/skills/coderabbit/references/pipelining.md`         | the session publishes `queue`, the collector cuts and pushes windows                  |
| `.agents/skills/coderabbit/references/release-pr-cutting.md` | the drain half is the collector, the cut half stays a human last resort               |
| `.agents/skills/coderabbit/SKILL.md`                         | the standing push ask names `queue`, and the gates cite the collector as their runner |
