# Native task-cache recording

Let the native backend produce task-cache entries, so "skip unchanged builds" works without the os sandbox (Linux hosts running the platform-branched `native` backend today get no task cache at all — `persist` falls back to a plain exec).

## Why deferred

The replay half is already backend-agnostic: `computeTaskCacheKey`, `resolveTaskCacheLocation`, and `replayTaskCache` never touch an overlay — a native run could compute the key, hit, and `applyFlushPlan` the payload onto the host as-is. The blocker is **recording**: an entry needs a `FlushOp[]` plan describing what the command produced/deleted, and today that plan comes exclusively from probing the overlay upper (`buildHostFlushPlan` → `OVERLAY_PROBE_SCRIPT`, char-device whiteouts + `user.overlay.*` xattrs). Native runs in place with no upper, so there is no diff to probe — it would need a backend-agnostic change-detection mechanism (e.g. a pre/post working-tree diff via the same `git ls-files -s` + untracked walk the key hashing already does) feeding the same `FlushOp[]` shape into `recordTaskCache`, plus an in-process reconciler replacing `applyFlushPlan`'s python-via-WSL transport on the native path. Doable, but a real seam to design — and the payoff is bounded: the dev-loop hosts that lean on the task cache today (win32) already run the os backend, and CI keeps the cache off by design (fresh commit → ~0 hits).

## Revisit when

A Linux-native dev loop (local Linux shells on this repo, or a consumer repo that pins `native`) demonstrably re-runs unchanged `typecheck`/`lint`/`test` often enough that replaying recorded runs would pay for the recording seam.
