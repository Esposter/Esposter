import { LOADED_BINARY_EXTENSIONS, WORKTREE_TRASH_FOLDER } from "#src/services/worktree/remove/constants";
import { randomUUID } from "node:crypto";
import { readdirSync, renameSync } from "node:fs";
import { extname, join } from "node:path";

// Windows refuses to delete any link of a native binary another checkout's process has loaded, but lets one move, so
// each is moved into the trash on the same volume and a later removal deletes it once nothing has it loaded
export const moveLoadedBinaries = (directory: string, trashPath: string): void => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const extension = extname(entry.name);
    if (entry.isDirectory()) moveLoadedBinaries(path, trashPath);
    else if (LOADED_BINARY_EXTENSIONS.has(extension)) renameSync(path, join(trashPath, `${randomUUID()}${extension}`));
  }
};
