import type { PathRename } from "#src/models/citations/PathRename";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

const RENAME_LINE_REGEX = /^R\d*\t(?<from>[^\t]+)\t(?<to>[^\t]+)$/u;

// A rename is reported per file, but a citation names whatever level of the tree it needs — a file, or the
// Directory it lives in. Stripping the path segments the two sides still share leaves the prefix that actually
// Moved, which rewrites a citation of the file, of any directory above it that moved with it, and nothing else:
// `a/b/c.ts → x/b/c.ts` is the prefix `a → x`, and `a/c.ts → a/d.ts` shares nothing so it is the whole path.
export const getRenamePrefixes = (nameStatus: string): PathRename[] => {
  const renames = new Map<string, string>();
  for (const line of getNonEmptyLines(nameStatus)) {
    const groups = RENAME_LINE_REGEX.exec(line)?.groups;
    if (!groups) continue;

    const from = (groups.from ?? "").split("/");
    const to = (groups.to ?? "").split("/");
    while (from.length > 1 && to.length > 1 && from.at(-1) === to.at(-1)) {
      from.pop();
      to.pop();
    }
    renames.set(from.join("/"), to.join("/"));
  }
  return Array.from(renames, ([from, to]) => ({ from, to })).filter(({ from, to }) => from !== to);
};
