import { checkGraph } from "#src/services/precheck/checkGraph";
import { checkLedgerUnits } from "#src/services/precheck/checkLedgerUnits";
import { checkIsLinkedWorktree } from "#src/services/queue/checkIsLinkedWorktree";
import { describe, expect, test } from "vitest";

/**
 * The precheck's checks that a clean checkout can run, so a commit that skips `pnpm ai:land` still meets them here. The
 * committed dependency graph is held to what pnpm installed, and the area list and each derived ledger to the tree: a
 * derived ledger's rows, each unit's paths, every tracked file a unit holds, and each unit's size. The formatter is CI's
 * `format:check`, and a ledger trailer needs the full history a one-commit checkout does not hold, so only the land reads it.
 */
describe("precheck", () => {
  // A linked worktree's narrowed install has no edges to its siblings, so it draws a graph the checkout does not commit.
  // The precheck skips the graph there for the same reason, and CI's and the main checkout's full install check it
  test.skipIf(checkIsLinkedWorktree())(
    "the committed dependency graph is the one drawn from the workspace the install resolved",
    async () => {
      expect.hasAssertions();

      expect((await checkGraph(false)).findings).toStrictEqual([]);
    },
  );

  test("the area list and each derived ledger hold to the tree", () => {
    expect.hasAssertions();

    expect(checkLedgerUnits()).toStrictEqual([]);
  });
});
