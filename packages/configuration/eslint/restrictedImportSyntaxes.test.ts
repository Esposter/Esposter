import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedImportSyntaxes from "@esposter/configuration/eslint/restrictedImportSyntaxes.js";
import { describe } from "vitest";

describe("restrictedImportSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedImportSyntaxes,
    fixtures: [
      {
        filePath: "zodNamespace.ts",
        name: "zodNamespace",
        source: `import { z } from "zod";\nz.string();`,
        violations: 0,
      },
      {
        filePath: "zodNamedImport.ts",
        name: "zodNamedImport",
        source: `import { z, ZodError } from "zod";\nz.string();\nZodError.name;`,
        violations: 1,
      },
      {
        filePath: "zodNamedTypeImport.test.ts",
        name: "zodNamedTypeImport",
        source: `import type { ZodType } from "zod";\nexport const a: ZodType = b;`,
        violations: 1,
      },
      {
        filePath: "prosemirror.ts",
        name: "prosemirror",
        source: `import { Plugin } from "prosemirror-state";\nexport const a = new Plugin({});`,
        violations: 1,
      },
      {
        filePath: "tiptapProsemirror.ts",
        name: "tiptapProsemirror",
        source: `import { Plugin } from "@tiptap/pm/state";\nexport const a = new Plugin({});`,
        violations: 0,
      },
      {
        filePath: "storageRestError.ts",
        name: "storageRestError",
        source: `import { RestError } from "@azure/storage-blob";\nexport const a = RestError.name;`,
        violations: 1,
      },
      {
        filePath: "pipelineRestError.ts",
        name: "pipelineRestError",
        source: `import { RestError } from "@azure/core-rest-pipeline";\nexport const a = RestError.name;`,
        violations: 0,
      },
    ],
  });
});
