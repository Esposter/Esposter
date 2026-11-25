import { checkLedgerUnits } from "#src/services/precheck/checkLedgerUnits";
import { describe, expect, test } from "vitest";

/** The precheck's checks that a clean checkout can run, so a commit that skips `pnpm ai:land` still meets them here.
 * The area list and each derived ledger are held to the tree: a derived ledger's rows, each unit's paths, every
 * tracked file a unit holds, and each unit's size. The committed dependency graph is held by its own suite,
 * `getGraphSvg.test.ts`. The formatter is CI's `format:check`, and a ledger trailer needs the full history a
 * one-commit checkout does not hold, so only the land reads it. */
describe("precheck", () => {
  test("the area list and each derived ledger hold to the tree", () => {
    expect.hasAssertions();

    expect(checkLedgerUnits()).toStrictEqual([]);
  });
});
