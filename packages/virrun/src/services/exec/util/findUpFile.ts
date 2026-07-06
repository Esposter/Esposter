import { statSync } from "node:fs";
import { dirname, join } from "node:path";

// Walks up from cwd to the filesystem root and returns the first ancestor path holding filename as a regular file,
// Or undefined when none does. The minimal up-walk primitive (replacing the former empathic dependency) for files
// Unconfig's config discovery doesn't cover — e.g. the pnpm lockfile anchoring resolveWorkspaceRoot.
export const findUpFile = (filename: string, cwd: string): string | undefined => {
  let currentDirectory = cwd;
  while (true) {
    const candidate = join(currentDirectory, filename);
    if (statSync(candidate, { throwIfNoEntry: false })?.isFile()) return candidate;
    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) return undefined;
    currentDirectory = parentDirectory;
  }
};
