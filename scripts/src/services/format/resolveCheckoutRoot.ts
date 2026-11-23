import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration/constants";
import { join, relative, sep } from "node:path";

// The checkout an absolute path lies in: the worktree folder under the main checkout's worktrees folder that holds it,
// Or The main checkout itself. Each checkout's ignore patterns name paths in its own tree, so a file is formatted under
// The Configuration of the checkout it is in, never the main checkout's, which ignores every worktree
export const resolveCheckoutRoot = (absolutePath: string, mainCheckoutRoot: string): string => {
  const worktreesDirectory = join(mainCheckoutRoot, AGENT_WORKTREES_DIRECTORY);
  const [worktreeName, ...rest] = relative(worktreesDirectory, absolutePath).split(sep);
  const isInWorktree = worktreeName !== undefined && rest.length > 0 && worktreeName !== "..";
  return isInWorktree ? join(worktreesDirectory, worktreeName) : mainCheckoutRoot;
};
