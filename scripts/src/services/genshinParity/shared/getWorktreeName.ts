import { basename, dirname } from "node:path";

// The checkout a repository root is: its folder when it is a worktree under `.agents/worktrees`, and `main` for the shared
// Checkout, so each checkout keeps its own shots and two agents never overwrite each other's
export const getWorktreeName = (repositoryRoot: string): string => {
  const worktreesDirectory = dirname(repositoryRoot);
  const isWorktree =
    basename(worktreesDirectory) === "worktrees" && basename(dirname(worktreesDirectory)) === ".agents";
  return isWorktree ? basename(repositoryRoot) : "main";
};
