# Running the collector by hand

Read when the collector has to be run by hand, which is only with its workflow off, or when a change to the collector is about to land.

`gh workflow disable ReviewCollector.yaml` stops every trigger, and `pnpm ai:coderabbit:collect` then runs the same cycle from a checkout whose `gh` login is the collector's account — never this checkout, which the script switches branches in and refuses when dirty, but a detached `git worktree add` on `origin/develop` with its own `pnpm i` and `@esposter/shared` build. The run is asked for, like any push to `develop`.

`gh workflow enable ReviewCollector.yaml` hands the cycle back, and from then on it is never also run by hand: the compare-and-swap refuses the loser, but the drain the loser ran was a Claude session spent for nothing.

`--dry-run` needs none of this: it ports into a throwaway worktree, pushes nothing and runs no Claude session.

## Landing a change to the collector

Every run checks out the `ai/queue` head and runs that copy of the script (`.github/workflows/run-review-collector.yaml`), so a queue push is a deploy. In this shared checkout any session's `pnpm ai:queue:push` carries every commit already on the branch, so a change to `scripts/src/services/coderabbit`, `scripts/src/coderabbit` or the collector's two workflows that is committed in parts goes live in parts, whoever pushes. Run 37952229125 ran one half-landed: its sync session resolved a replay of hundreds of commits for $5.92, then `replayOwed` read a field the new `runSession` no longer returned, took the finished session for one that never started, and threw aborting a pick no longer in progress — the run pushed nothing it had paid for.

So the workflow is disabled with `gh workflow disable ReviewCollector.yaml` before the change's first commit, the change goes out in one push, and once that push is on `origin/ai/queue` the workflow is enabled with `gh workflow enable ReviewCollector.yaml` and woken with `gh workflow run ReviewCollector.yaml --ref ai/queue`, the dispatch the retrigger itself sends — the push's own event arrived while the workflow was off, and so did every retrigger meanwhile. Nothing else is lost: every run derives its work from the remote, so that first run picks up whatever arrived while it was off.
