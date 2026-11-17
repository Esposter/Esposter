import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedUtilImports from "@esposter/configuration/eslint/restrictedUtilImports.js";
import { describe } from "vitest";

describe("restrictedUtilImports", () => {
  setupSyntaxSuite({
    entries: restrictedUtilImports.patterns,
    fixtures: [
      {
        filePath: "util/fetchRoom.ts",
        name: "utilThirdPartyImport",
        source: 'import { z } from "zod";\nexport const a = z.string();',
        violations: 1,
      },
      {
        filePath: "services/fetchRoom.ts",
        name: "servicesThirdPartyImport",
        source: 'import { z } from "zod";\nexport const a = z.string();',
        violations: 0,
      },
    ],
  });
});
