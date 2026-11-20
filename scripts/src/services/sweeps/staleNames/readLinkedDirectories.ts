import { existsSync, readdirSync, realpathSync } from "node:fs";
import { join, sep } from "node:path";

// The real directory of every package a `node_modules` folder links, a scope's packages read one level down. pnpm's own
// Hidden entries (`.bin`, `.pnpm`, `.modules.yaml`) are skipped, and a link that resolves nowhere is dropped. A
// Package that is a workspace member resolves outside any `node_modules` folder, so it is dropped too: the walk starts
// From each member's own folder rather than following into the repository
export const readLinkedDirectories = (modulesDirectory: string): string[] => {
  if (!existsSync(modulesDirectory)) return [];

  return readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .flatMap((entry) =>
      entry.name.startsWith("@")
        ? readdirSync(join(modulesDirectory, entry.name), { withFileTypes: true }).map((scopedEntry) =>
            join(modulesDirectory, entry.name, scopedEntry.name),
          )
        : [join(modulesDirectory, entry.name)],
    )
    .filter((linkPath) => existsSync(linkPath))
    .map((linkPath) => realpathSync(linkPath))
    .filter((directory) => directory.split(sep).includes("node_modules"));
};
