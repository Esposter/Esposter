import { rm } from "node:fs/promises";

// Removes a folder its writer owns before the writer writes into it, so a file an earlier run left there and this run
// No longer writes is gone. Nothing beside the folder is touched, since the folder is the writer's alone
export const clearOwnedFolder = (directory: string): Promise<void> => rm(directory, { force: true, recursive: true });
