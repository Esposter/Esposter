// An entry of a task's `cache.input` or `cache.output`, as `vp` reads it: a glob resolved from the package or the workspace
// Root, or the flag that keeps automatic tracking on
// oxlint-disable-next-line literal-union/no-string-literal-union -- `vp` types `base` as these two literals, and this module loads under Node's type stripping, which cannot run an enum
export type CachePattern = string | { auto: boolean } | { base: "package" | "workspace"; pattern: string };
