---
title: Task-cache eviction
description: Proposal — bound the host-global tasks/ directory, the one cache surface with no superseded-entry prune.
---

# Task-Cache Eviction

Bound the host-global `~/.virrun/tasks/` directory. Every other cache surface is self-pruning — `snapshots/` and `prepare/` sweep superseded hash dirs on each run, source mirrors reap on origin death — but `tasks/` only ever grows: each (lockfile, working-tree, command) state mints a new `tasks/<key>` entry with a full produced-file payload (a `pnpm build` entry carries `dist/`), and nothing removes old ones short of `cache clean --all`.

## Scope

**Today:** `recordTaskCache` reaps only hard-killed recorder **temps** in the tasks root; published entries persist forever. On an active dev loop every source edit creates fresh keys for each prefixed command, so the directory grows by one payload per command per tree state, unbounded.

**This adds:** an age-based prune of published task entries, run beside the existing sweeps, plus size visibility in `cache ls`.

## Why age-based, not superseded-based

Snapshots can prune "everything but the current hash" because only the current lockfile's snapshot is ever forked. Task keys don't work that way: switching branches flips the working-tree hash **back** to an earlier value, so an "old" key can become current again — there is no well-defined superseded set. The honest signal is recency: an entry not hit for N days is dead weight, and losing a live one costs only one re-run (the cache is a pure accelerator; replay correctness never depends on an entry existing).

## How it works

1. **Touch on hit** — `replayTaskCache` bumps the entry's mtime (`utimesSync` on `meta.json`) so recency reflects use, not creation. `resolveTaskCacheLocation` stays pure.
2. **Prune on record** — in `recordTaskCache`, beside the existing `reapStaleTemps` call, sweep published `tasks/<key>` entries whose `meta.json` mtime is older than `TASK_CACHE_MAX_AGE_DAYS` (constant in `services/exec/cache/constants.ts`; default 14). Reuse `sweepStaleEntries(tasksRoot, isStale)` — the predicate is "not a temp, meta older than cutoff". Detached, best-effort, off the critical path, exactly like the snapshot prunes.
3. **No lease needed** — a replay reads an entry in-process within milliseconds and the cutoff is days; unlike snapshot lowers (mounted for a run's whole duration), there is no long-lived reader to protect. A concurrent replay racing a prune loses at worst one hit and re-runs — the always-safe fallback.
4. **`cache ls`** — report entry count and total payload size for `tasks/` so the bound is observable.

## Key files

Paths relative to `packages/virrun/src/`.

| File                                                | Change                                                        |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `services/exec/cache/constants.ts`                  | `TASK_CACHE_MAX_AGE_DAYS`                                     |
| `services/exec/cache/replayTaskCache.ts`            | touch `meta.json` on hit                                      |
| `services/exec/cache/recordTaskCache.ts`            | age-prune published entries beside the temp reap              |
| `services/exec/cache/pruneStaleTaskCacheEntries.ts` | new — the `sweepStaleEntries` predicate wrapper (+ unit test) |
| `services/cli/` (cache command)                     | `cache ls` reports tasks/ count + size                        |

## Notes

- Failure semantics inherit the cache's rules: the prune is best-effort and never aborts the run; a torn removal is re-swept next record.
- A size budget (LRU to a byte cap) was considered and dropped for now: it needs a full-directory stat walk on the hot path to know the total, while the age cutoff is a single mtime comparison per entry during an already-off-path sweep. Add a budget only if a measured workload keeps 14 days of entries too large.
