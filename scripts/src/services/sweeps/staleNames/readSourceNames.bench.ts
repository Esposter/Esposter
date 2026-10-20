import { CACHE_DIRECTORY } from "#src/services/shared/constants";
import { readSourceNames } from "#src/services/sweeps/staleNames/readSourceNames";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "vitest";

// The names a stale-names scan reads from the tree, warm from the cache its last run left and cold with that cache
// Removed first. What it measures is the host's disk and its worktree beside this repo's code, at a cost of minutes,
// so it is off once its numbers are committed. Flip it on when the scan changes: set `IS_ENABLED`, run `pnpm bench`
// In this package, commit the artifact, and flip it back. The warm task runs first, so it reads the cache left before
// The bench started
const IS_CI = Boolean(process.env.CI);
const IS_ENABLED = false;
const isBenchable = IS_ENABLED && !IS_CI;
const SOURCE_WORD_CACHE_PATH = join(CACHE_DIRECTORY, "sourceWords.json");

describe.skipIf(!isBenchable)(readSourceNames, () => {
  test("read the names the tracked tree holds", async ({ bench }) => {
    await bench.compare(
      bench("warm", () => {
        readSourceNames();
      }),
      bench("cold", () => {
        rmSync(SOURCE_WORD_CACHE_PATH, { force: true });
        readSourceNames();
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
