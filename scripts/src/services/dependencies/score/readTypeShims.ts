import { TYPE_SHIM_PATTERN, IMPORT_GREP_PATHSPECS } from "#src/services/dependencies/score/constants";
import { getFileTypeShims } from "#src/services/dependencies/score/getFileTypeShims";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every package's type workarounds across the tracked source, summed over the files that hold any so each is read once
export const readTypeShims = (): Map<string, number> => {
  const packageNameCountMap = new Map<string, number>();
  const paths = getNonEmptyLines(runGit(["grep", "-l", "-E", TYPE_SHIM_PATTERN, "--", ...IMPORT_GREP_PATHSPECS]));

  for (const path of paths)
    for (const [packageName, count] of getFileTypeShims(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")))
      packageNameCountMap.set(packageName, (packageNameCountMap.get(packageName) ?? 0) + count);

  return packageNameCountMap;
};
