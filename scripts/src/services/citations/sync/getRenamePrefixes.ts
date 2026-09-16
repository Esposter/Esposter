import type { PathRename } from "#src/models/citations/PathRename";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getOrCreate } from "@esposter/shared";

const RENAME_LINE_REGEX = /^R\d*\t(?<from>[^\t]+)\t(?<to>[^\t]+)$/u;

// A rename is reported per file, but a citation names whatever level of the tree it needs — a file, or the
// Directory it lives in. Stripping the path segments the two sides still share leaves the prefix that actually
// Moved, which rewrites a citation of the file, of any directory above it that moved with it, and nothing else:
// `a/b/c.ts → x/b/c.ts` is the prefix `a → x`, and `a/c.ts → a/d.ts` shares nothing so it is the whole path.
// Two unrelated renames can strip to the same prefix pointing at different places (`a/b/c.ts → x/b/c.ts` beside
// `a/d/e.ts → y/d/e.ts` is `a → x` and `a → y`), and there is no answer for a citation of `a` itself — so an
// Ambiguous prefix is dropped in favour of the file paths it was derived from, which each name one destination.
export const getRenamePrefixes = (nameStatus: string): PathRename[] => {
  const prefixes = new Map<string, { destinations: Set<string>; paths: PathRename[] }>();
  for (const line of getNonEmptyLines(nameStatus)) {
    const groups = RENAME_LINE_REGEX.exec(line)?.groups;
    if (!groups) continue;

    const path = { from: groups.from ?? "", to: groups.to ?? "" };
    const from = path.from.split("/");
    const to = path.to.split("/");
    while (from.length > 1 && to.length > 1 && from.at(-1) === to.at(-1)) {
      from.pop();
      to.pop();
    }
    const prefix = getOrCreate(prefixes, from.join("/"), () => ({ destinations: new Set<string>(), paths: [] }));
    prefix.destinations.add(to.join("/"));
    prefix.paths.push(path);
  }
  return Array.from(prefixes, ([from, { destinations, paths }]) => {
    const [to] = destinations;
    return destinations.size === 1 && to !== undefined ? [{ from, to }] : paths;
  })
    .flat()
    .filter(({ from, to }) => from !== to);
};
