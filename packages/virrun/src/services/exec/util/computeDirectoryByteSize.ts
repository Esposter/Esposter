import { getResult } from "@esposter/shared";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
// Sum the on-disk byte size of every regular file under `dir` (recursively), best-effort: a file that vanishes or
// Can't be stat'd mid-walk contributes 0 rather than aborting. Absent dir = 0. Used by `cache ls` to make the
// Task-cache payload total observable so the age-eviction bound is legible; not on any hot path.
export const computeDirectoryByteSize = (dir: string): number => {
  if (!existsSync(dir)) return 0;
  let total = 0;
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true }))
    if (entry.isFile()) total += getResult(() => statSync(join(entry.parentPath, entry.name)).size).unwrapOr(0);
  return total;
};
