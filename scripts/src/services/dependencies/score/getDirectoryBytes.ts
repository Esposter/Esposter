import { NODE_MODULES_DIRECTORY } from "#src/services/dependencies/score/constants";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// The bytes of every file under a directory, its `node_modules` left out: a package's dependencies are counted from
// Their own directories, so none is counted twice
export const getDirectoryBytes = (directory: string): number => {
  let bytes = 0;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== NODE_MODULES_DIRECTORY) bytes += getDirectoryBytes(entryPath);
    else if (entry.isFile()) bytes += statSync(entryPath).size;
  }

  return bytes;
};
