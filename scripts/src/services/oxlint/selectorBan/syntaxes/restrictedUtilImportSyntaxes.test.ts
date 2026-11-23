import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_UTIL_IMPORT_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedUtilImportSyntaxes";
import { describe } from "vitest";

describe("restrictedUtilImportSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_UTIL_IMPORT_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "util/package.ts",
        name: "packageImport",
        source: `import { z } from "zod";\nexport const a = z.string();`,
        violations: 1,
      },
      {
        filePath: "util/scopedPackage.ts",
        name: "scopedPackageImport",
        source: `import { a } from "@vueuse/core";\nexport const b = a;`,
        violations: 1,
      },
      { filePath: "util/sideEffect.ts", name: "sideEffectImport", source: `import "zod";`, violations: 1 },
      { filePath: "util/reexport.ts", name: "packageReexport", source: `export { z } from "zod";`, violations: 1 },
      {
        filePath: "util/inlineTypeReexport.ts",
        name: "inlineTypeReexport",
        source: `export { type ZodType } from "zod";`,
        violations: 0,
      },
      {
        filePath: "util/mixedReexport.ts",
        name: "mixedReexport",
        source: `export { type ZodType, z } from "zod";`,
        violations: 1,
      },
      {
        filePath: "util/typeImport.ts",
        name: "typeImport",
        source: `import type { ZodType } from "zod";\nexport type A = ZodType;`,
        violations: 0,
      },
      {
        filePath: "util/inlineTypeImport.ts",
        name: "inlineTypeImport",
        source: `import { type ZodType } from "zod";\nexport type A = ZodType;`,
        violations: 0,
      },
      {
        filePath: "util/node.ts",
        name: "nodeImport",
        source: `import { join } from "node:path";\nexport const a = join;`,
        violations: 0,
      },
      {
        filePath: "util/workspace.ts",
        name: "workspaceImport",
        source: `import { a } from "@esposter/shared";\nexport const b = a;`,
        violations: 0,
      },
      {
        filePath: "util/alias.ts",
        name: "aliasImport",
        source: `import { a } from "#shared/a";\nexport const b = a;`,
        violations: 0,
      },
      {
        filePath: "services/package.ts",
        name: "servicesPackageImport",
        source: `import { z } from "zod";\nexport const a = z.string();`,
        violations: 0,
      },
      {
        filePath: "util/package.test.ts",
        name: "testPackageImport",
        source: `import { z } from "zod";\nexport const a = z.string();`,
        violations: 0,
      },
    ],
  });
});
