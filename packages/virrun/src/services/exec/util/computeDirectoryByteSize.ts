import { getResult } from "@esposter/shared";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Sum the on-disk byte size of every regular file under `dir` (recursively), best-effort: a file that vanishes or
// Can't be stat'd mid-walk contributes 0 rather than aborting, and an absent dir or a directory vanishing mid-walk
// (which throws from the recursive readdir itself) yields 0. Used by `cache ls` to make the task-cache payload total
// Observable so the age-eviction bound is legible; not on any hot path.
export const computeDirectoryByteSize = (dir: string): number =>
  getResult(() => {
    let total = 0;
    for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true }))
      if (entry.isFile()) total += getResult(() => statSync(join(entry.parentPath, entry.name)).size).unwrapOr(0);
    return total;
  }).unwrapOr(0);
