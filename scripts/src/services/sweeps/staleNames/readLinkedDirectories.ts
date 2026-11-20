import { checkIsDirectoryEntry } from "#src/services/sweeps/staleNames/checkIsDirectoryEntry";
import { existsSync, readdirSync, realpathSync } from "node:fs";
import { join, sep } from "node:path";

// The real directory of every package a `node_modules` folder links, a scope's packages read one level down. pnpm's own
// Hidden entries (`.bin`, `.pnpm`, `.modules.yaml`) are skipped, and so is any entry that is neither a directory nor a
// Link to one: a file is not a package, and a link that resolves nowhere is dropped. A
// Package that is a workspace member resolves outside any `node_modules` folder, so it is dropped too: the walk starts
// From each member's own folder rather than following into the repository
export const readLinkedDirectories = (modulesDirectory: string): string[] => {
  if (!existsSync(modulesDirectory)) return [];

  return readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith(".") && checkIsDirectoryEntry(modulesDirectory, entry))
    .flatMap((entry) => {
      const entryPath = join(modulesDirectory, entry.name);
      if (!entry.name.startsWith("@")) return [entryPath];

      return readdirSync(entryPath, { withFileTypes: true })
        .filter((scopedEntry) => checkIsDirectoryEntry(entryPath, scopedEntry))
        .map((scopedEntry) => join(entryPath, scopedEntry.name));
    })
    .map((linkPath) => realpathSync(linkPath))
    .filter((directory) => directory.split(sep).includes("node_modules"));
};
