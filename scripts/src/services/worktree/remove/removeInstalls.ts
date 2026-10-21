import { GIT_FOLDER, NODE_MODULES_FOLDER } from "#src/services/worktree/remove/constants";
import { removeTree } from "#src/services/worktree/remove/removeTree";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Removes every node_modules under a worktree, never entering `.git`: it is untracked, so git's dirty check is unchanged
export const removeInstalls = (directory: string, trashPath: string): void => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === GIT_FOLDER) continue;
    const path = join(directory, entry.name);
    if (entry.name === NODE_MODULES_FOLDER) removeTree(path, trashPath);
    else removeInstalls(path, trashPath);
  }
};
