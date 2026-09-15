// Every git process a script spawns addresses a repository by `cwd`, and git reads an ambient selector ahead of
// It: `GIT_DIR`, `GIT_COMMON_DIR`, `GIT_WORK_TREE` or `GIT_INDEX_FILE` — a pre-commit hook exports the last to
// Everything it runs — point the call at a repository the caller never named, and the object-store pair sends the
// Objects it writes to a store the caller never named, silently, whatever `cwd` says. Dropping them is what makes
// `cwd` the address: the fixture repository's commits stay out of this checkout, and a scan pinned to the root
// Cannot be redirected into another tree.
export const getGitEnv = (): NodeJS.ProcessEnv => ({
  ...process.env,
  GIT_ALTERNATE_OBJECT_DIRECTORIES: undefined,
  GIT_COMMON_DIR: undefined,
  GIT_DIR: undefined,
  GIT_INDEX_FILE: undefined,
  GIT_OBJECT_DIRECTORY: undefined,
  GIT_WORK_TREE: undefined,
});
