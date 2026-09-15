// Every git process a script spawns addresses a repository by `cwd`, and git reads these three ahead of it: an
// Ambient `GIT_DIR`, `GIT_WORK_TREE` or `GIT_INDEX_FILE` — a pre-commit hook exports the last to everything it
// Runs — points the call at a repository the caller never named, silently, whatever `cwd` says. Dropping them is
// What makes `cwd` the address: the fixture repository's commits stay out of this checkout, and a scan pinned to
// The root cannot be redirected into another tree.
export const getGitEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  GIT_DIR: undefined,
  GIT_INDEX_FILE: undefined,
  GIT_WORK_TREE: undefined,
});
