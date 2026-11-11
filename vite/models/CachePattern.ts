import type { CachePatternBase } from "#vite/models/CachePatternBase";

// An entry of a task's `cache.input` or `cache.output`, as `vp` reads it: a glob resolved from the package or the workspace
// Root, or the flag that keeps automatic tracking on
export type CachePattern = string | { auto: boolean } | { base: CachePatternBase; pattern: string };
