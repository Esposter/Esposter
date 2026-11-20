import type { Dirent } from "node:fs";

import { statSync } from "node:fs";
import { join } from "node:path";

// A directory, or a link that resolves to one, which is followed to its target. A file, and a link that resolves
// Nowhere, is neither, so the walk does not read a file as a package
export const checkIsDirectoryEntry = (parentDirectory: string, entry: Dirent): boolean => {
  if (entry.isDirectory()) return true;
  if (!entry.isSymbolicLink()) return false;

  return statSync(join(parentDirectory, entry.name), { throwIfNoEntry: false })?.isDirectory() ?? false;
};
