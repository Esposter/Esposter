// Resolves the "empty cwd means the current process cwd" convention shared across the backends, store, and
// Snapshot path builders.
export const resolveCwd = (cwd: string): string => (cwd === "" ? process.cwd() : cwd);
