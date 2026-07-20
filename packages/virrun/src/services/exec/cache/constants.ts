// Host-global task-cache layout, under getGlobalCacheDirectory()/tasks/<key>/ (specs/config-and-cache.md). A cache
// Entry records one exit-0 persist run so an identical later run (same command + lockfile + source tree) skips the
// Sandbox entirely and replays the recorded result — the dev-loop "skip unchanged builds" lever (roadmap.md).
export const VIRRUN_TASKS_DIRECTORY_NAME = "tasks";
// The recorded outcome (exit code, stdout, stderr, flush plan) beside the entry's `upper` payload dir. `upper`
// Mirrors the snapshot layout so both caches read the same way; it holds the copy-op payload the replay flushes.
export const TASK_CACHE_META_FILENAME = "meta.json";
export const TASK_CACHE_PAYLOAD_DIRECTORY_NAME = "upper";
// The reap prefix every pid-tagged task-cache temp starts with, sitting beside the published `tasks/<key>` entries.
// Content-hash keys are dotless, so a published entry never collides with this dotted prefix; reapStaleTemps reclaims a
// Hard-killed recorder's `.tmp.<pid>.<rand>` corpse (no other sweep touches the tasks dir).
export const TASK_CACHE_TEMP_PREFIX = ".tmp.";
// Cap above the default 1 MB so a large unstaged working-tree diff (the source-tree hash reads `git diff --binary`)
// Never overflows the exec buffer.
export const SOURCE_TREE_HASH_MAX_BUFFER: number = 256 * 1024 * 1024;
// A published `tasks/<key>` entry not replayed within this many days is dead weight and swept on the next record.
// Task keys have no superseded set (a branch switch flips the working-tree hash back to an earlier value, so an "old"
// Key can become current again), so recency is the only honest eviction signal — and losing a live one costs a single
// Re-run, the cache being a pure accelerator. Touched on every hit (replayTaskCache) so age reflects use, not creation.
export const TASK_CACHE_MAX_AGE_DAYS = 14;
