import { mkdirSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

// Creates the build's directory if it is absent and returns its real path. NuGet's restore drops a project reference that
// Is reached through a symlink, so a CLI built under a symlinked tools folder restores without its projects' packages
export const resolveBuildDirectory = (directory: string): string => {
  const absoluteDirectory = resolve(directory);
  mkdirSync(absoluteDirectory, { recursive: true });
  return realpathSync(absoluteDirectory);
};
