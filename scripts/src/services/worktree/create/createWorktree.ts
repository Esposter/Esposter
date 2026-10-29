import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { QUEUE_BRANCH, REMOTE_NAME, REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { WORKTREE_NAME_REGEX } from "#src/services/worktree/create/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { join } from "node:path";

// Creates a worktree on a branch of its own name, from ai/queue as origin holds it, under the main checkout's worktrees
// Folder, and returns its full path. The name is one folder name, so the path cannot resolve against any other directory
export const createWorktree = (name: string, mainCheckoutRoot: string): string => {
  if (!WORKTREE_NAME_REGEX.test(name))
    throw new InvalidOperationError(
      Operation.Create,
      name,
      "a worktree is named with lowercase letters, digits and hyphens",
    );
  const worktreePath = join(mainCheckoutRoot, AGENT_WORKTREES_DIRECTORY, name);
  runGit(["fetch", "--quiet", REMOTE_NAME, QUEUE_BRANCH], mainCheckoutRoot);
  runGit(["worktree", "add", "-b", name, worktreePath, REMOTE_QUEUE_REF], mainCheckoutRoot);
  return worktreePath;
};
