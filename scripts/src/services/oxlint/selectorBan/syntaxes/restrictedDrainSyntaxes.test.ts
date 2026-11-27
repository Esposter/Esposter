import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_DRAIN_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedDrainSyntaxes";
import { describe } from "vitest";

const createFixture = (name: string, statement: string, violations: number) => ({
  filePath: "a.test.ts",
  name,
  source: `import { afterEach, test } from "vitest";\n${statement}`,
  violations,
});

describe("restrictedDrainSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_DRAIN_SYNTAXES.bans,
    fixtures: [
      createFixture("lastStatementDrain", 'test("a", async () => { a(); await waitForSynchronizedFunctions(); });', 1),
      createFixture(
        "drainBeforeAssertion",
        'test("a", async () => { a(); await waitForSynchronizedFunctions(); expect(b).toBe(1); });',
        0,
      ),
      // A suite's own after hook may need its drain ahead of an earlier hook, which runs before the shared setup's
      createFixture("afterEachDrain", "afterEach(async () => { await waitForSynchronizedFunctions(); });", 0),
    ],
  });
});
