import type { Dirent } from "node:fs";

import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// A directory, or a link that resolves to one, which is followed to its target. A file, and a link that resolves
// Nowhere (a dangling one, or one that loops back on itself), is neither, so the walk does not read a file as a package
export const checkIsDirectoryEntry = (parentDirectory: string, entry: Dirent): boolean => {
  if (entry.isDirectory()) return true;
  if (!entry.isSymbolicLink()) return false;

  const entryPath = join(parentDirectory, entry.name);
  return existsSync(entryPath) && statSync(entryPath).isDirectory();
};
