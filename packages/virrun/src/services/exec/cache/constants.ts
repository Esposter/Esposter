/* oxlint-disable no-inferrable-types */
// Host-global task-cache layout, under getGlobalCacheDirectory()/tasks/<key>/ (specs/config-and-cache.md). A cache
// Entry records one exit-0 persist run so an identical later run (same command + lockfile + source tree) skips the
// Sandbox entirely and replays the recorded result — the dev-loop "skip unchanged builds" lever (roadmap.md).
export const VIRRUN_TASKS_DIRECTORY_NAME = "tasks";
// The recorded outcome (exit code, stdout, stderr, flush plan) beside the entry's `upper` payload dir. `upper`
// Mirrors the snapshot layout so both caches read the same way; it holds the copy-op payload the replay flushes.
export const TASK_CACHE_META_FILENAME = "meta.json";
export const TASK_CACHE_PAYLOAD_DIRECTORY_NAME = "upper";
// Cap above the default 1 MB so a large unstaged working-tree diff (the source-tree hash reads `git diff --binary`)
// Never overflows the exec buffer.
export const SOURCE_TREE_HASH_MAX_BUFFER: number = 256 * 1024 * 1024;
