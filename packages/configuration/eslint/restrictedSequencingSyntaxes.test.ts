import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedSequencingSyntaxes from "@esposter/configuration/eslint/restrictedSequencingSyntaxes.js";
import { describe } from "vitest";

describe("restrictedSequencingSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedSequencingSyntaxes,
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
