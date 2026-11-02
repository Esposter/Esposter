import { AGENT_WORKTREES_DIRECTORY } from "@esposter/configuration";
import { dirname, join } from "node:path";

// A folder under the worktrees folder that git no longer lists, given as a resolved path. Only this checkout's worktrees
// Folder holds the worktrees a removal may delete without git's say, so a folder in any other checkout is refused
export const checkIsOrphanPath = (resolvedPath: string, mainCheckoutRoot: string): boolean =>
  dirname(resolvedPath) === join(mainCheckoutRoot, AGENT_WORKTREES_DIRECTORY);
