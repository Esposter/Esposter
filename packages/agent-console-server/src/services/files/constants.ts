// The largest file the page's read-only view will take, past which the host says so rather than sending its text
export const REPOSITORY_FILE_MAX_BYTE_LENGTH: number = 512 * 1024;
// Directories a fallback walk does not descend into: a repository's own bookkeeping and its installed packages
export const REPOSITORY_WALK_IGNORED_NAMES: ReadonlySet<string> = new Set([".git", "node_modules"]);
