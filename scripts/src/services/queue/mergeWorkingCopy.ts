import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MERGE_PREFIX = "queue-merge-";

// Three-way merges `ours`, the working copy, with `theirs` over their common `base`. git merge-file takes paths, so the
// Three sides are copied into a throwaway directory and the merged copy is read back from it. A conflict exits non-zero,
// Which is the refusal: the result is undefined, and nothing outside the throwaway directory was written
export const mergeWorkingCopy = (ours: string, base: string, theirs: string): string | undefined => {
  const directory = mkdtempSync(join(tmpdir(), MERGE_PREFIX));
  const oursPath = join(directory, "ours");
  const basePath = join(directory, "base");
  const theirsPath = join(directory, "theirs");
  writeFileSync(oursPath, ours);
  writeFileSync(basePath, base);
  writeFileSync(theirsPath, theirs);
  const isMerged = getResult(() => runGit(["merge-file", oursPath, basePath, theirsPath])).match(
    () => true,
    () => false,
  );
  const merged = isMerged ? readFileSync(oursPath, "utf8") : undefined;
  rmSync(directory, { force: true, recursive: true });
  return merged;
};
