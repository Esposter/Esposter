import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// Every sweep check starts with this listing, so its cost is paid once per check. What it measures is the host's git
// And its worktree rather than this repo's code, at a cost of about a minute, so it is off once its numbers are
// Committed. Flip it on when the listing itself changes: set `IS_ENABLED`, run `pnpm bench` in this package, commit the
// Artifact, and flip it back. A narrow pathspec and the whole tree cost about the same, because git stats every tracked
// File for its deleted check whatever the pathspec, so the comparison is kept as proof they cost the same
const IS_CI = Boolean(process.env.CI);
const IS_ENABLED = false;
const isBenchable = IS_ENABLED && !IS_CI;

describe.skipIf(!isBenchable)(readSweepFilePaths, () => {
  test("list the tracked and untracked files a pathspec matches", async ({ bench }) => {
    await bench.compare(
      bench("narrow pathspec", () => {
        readSweepFilePaths("**/Pulumi.*.yaml");
      }),
      bench("whole tree", () => {
        readSweepFilePaths(".");
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
