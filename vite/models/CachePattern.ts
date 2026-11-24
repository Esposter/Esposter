import type { CacheBase } from "#vite/models/CacheBase";

// An entry of a task's `cache.input` or `cache.output`, as `vp` reads it.
// It is a glob resolved from the package or the workspace root, or the flag that keeps automatic tracking on.
export type CachePattern = { auto: boolean } | { base: CacheBase; pattern: string } | string;
