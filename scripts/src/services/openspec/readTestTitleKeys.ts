import { getTitleKey } from "#src/services/openspec/getTitleKey";
import { readTestTitles } from "#src/services/openspec/readTestTitles";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The key of every test title the repository's test files register, written and not yet added ones included. A ticked
// Task's claim is held by a title among them.
export const readTestTitleKeys = (): Set<string> =>
  new Set(
    readSweepFilePaths("*.test.ts", "*.test.mts", "*.test-d.ts").flatMap((path) =>
      readTestTitles(readFileSync(join(REPOSITORY_ROOT, path), "utf8")).map((title) => getTitleKey(title)),
    ),
  );
