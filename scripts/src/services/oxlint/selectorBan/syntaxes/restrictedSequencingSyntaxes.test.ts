import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_SEQUENCING_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedSequencingSyntaxes";
import { describe } from "vitest";

describe("restrictedSequencingSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_SEQUENCING_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "app/composables/counterCapturedAsId.ts",
        name: "counterCapturedAsId",
        source: "const refreshId = ++latestRefreshId;",
        violations: 1,
      },
      {
        filePath: "app/composables/counterPostfixCapturedAsId.ts",
        name: "counterPostfixCapturedAsId",
        source: "let readId = latestReadId++;",
        violations: 1,
      },
      {
        filePath: "app/composables/counterStepStatement.ts",
        name: "counterStepStatement",
        source: "++latestRefreshId;",
        violations: 0,
      },
    ],
  });
});
