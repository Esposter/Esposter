import { existsSync, readdirSync } from "node:fs";
import { join, posix } from "node:path";

// A listed path is deleted when its directory no longer holds its name, and a directory that is gone deletes every
// Path under it. One listing per directory answers for each file in it, where a stat per path costs more than git's
// Own deleted walk over a whole tree; the paths are repository-relative, with `/` whatever the platform. A name the
// Listing lacks is stat'd too, since a case-only difference from the index is a file git still finds on a
// Case-insensitive filesystem, and skipping it would be the silent pass a scan exists to rule out
export const readDeletedPaths = (paths: readonly string[], root: string): Set<string> => {
  const directoryEntryNamesMap = new Map(
    Array.from(new Set(paths.map((path) => posix.dirname(path))), (directory): [string, Set<string>] => {
      const directoryPath = join(root, directory);
      return [directory, new Set(existsSync(directoryPath) ? readdirSync(directoryPath) : [])];
    }),
  );
  return new Set(
    paths.filter(
      (path) =>
        !directoryEntryNamesMap.get(posix.dirname(path))?.has(posix.basename(path)) && !existsSync(join(root, path)),
    ),
  );
};
