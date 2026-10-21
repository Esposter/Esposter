import { REMOVE_MAX_RETRIES } from "#src/services/worktree/remove/constants";
import { moveLoadedBinaries } from "#src/services/worktree/remove/moveLoadedBinaries";
import { rmSync } from "node:fs";

// An install's paths outrun Windows' 260-character limit, which git cannot delete, so a tree is removed by node, with its
// loaded binaries moved aside first
export const removeTree = (path: string, trashPath: string): void => {
  moveLoadedBinaries(path, trashPath);
  rmSync(path, { force: true, maxRetries: REMOVE_MAX_RETRIES, recursive: true });
};
