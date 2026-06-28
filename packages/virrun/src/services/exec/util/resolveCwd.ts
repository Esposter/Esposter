// The single place that resolves the "empty cwd means the current process cwd" convention shared across
// The backends, store, and snapshot path builders — so the `cwd === "" ? process.cwd() : cwd` check lives
// Once rather than being re-derived at every call site.
export const resolveCwd = (cwd: string): string => (cwd === "" ? process.cwd() : cwd);
