import { HAND_WRITTEN_ENTRY_LINE } from "#src/services/precheck/constants";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Whether a package writes its own `src/index.ts`, which it un-ignores in its own `.gitignore` because the root ignore
// Names the barrels a build writes. Such an entry is no generator's output, so the precheck must never write over it
export const checkIsHandWrittenEntry = (packageRoot: string): boolean => {
  const gitignorePath = join(packageRoot, ".gitignore");
  return existsSync(gitignorePath) && readFileSync(gitignorePath, "utf8").split("\n").includes(HAND_WRITTEN_ENTRY_LINE);
};
