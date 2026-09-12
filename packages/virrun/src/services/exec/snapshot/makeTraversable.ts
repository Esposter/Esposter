import { chmodSync, readdirSync } from "node:fs";
import { join } from "node:path";
// Restores +rwx top-down ahead of a removal: a capture overlay's on-disk `work/work` scratch is left at mode 000
// (un-traversable), and Node's recursive rmSync refuses to chmod before descending, so a plain remove EACCES-es on
// It. Harmless on an ordinary tree, so callers needn't reason about whether a given directory is poisoned.
export const makeTraversable = (directory: string): void => {
  chmodSync(directory, 0o700);
  for (const entry of readdirSync(directory, { withFileTypes: true }))
    if (entry.isDirectory()) makeTraversable(join(directory, entry.name));
};
