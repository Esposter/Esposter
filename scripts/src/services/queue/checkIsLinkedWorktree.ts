import { runGit } from "#src/services/shared/runGit";

// A linked worktree keeps its own git directory under the common one, so the two differ only in one
export const checkIsLinkedWorktree = (cwd?: string): boolean => {
  const gitDirectory = runGit(["rev-parse", "--path-format=absolute", "--git-dir"], cwd).trim();
  const commonDirectory = runGit(["rev-parse", "--path-format=absolute", "--git-common-dir"], cwd).trim();
  return gitDirectory !== commonDirectory;
};
