import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortNamedImports", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `import { a, b } from "x";\nexport const u = [a, b];`,
        name: "unsortedSpecifiers",
        source: `import { b, a } from "x";\nexport const u = [a, b];`,
        violations: 1,
      },
      { name: "sortedSpecifiers", source: `import { a, b } from "x";\nexport const u = [a, b];`, violations: 0 },
      { name: "sortsByLocalName", source: `import { z as a, b } from "x";\nexport const u = [a, b];`, violations: 0 },
      { name: "aliasChangesOrder", source: `import { a as z, b } from "x";\nexport const u = [z, b];`, violations: 1 },
      {
        fixed: `import d, { a, b } from "x";\nexport const u = [d, a, b];`,
        name: "defaultAndNamed",
        source: `import d, { b, a } from "x";\nexport const u = [d, a, b];`,
        violations: 1,
      },
      {
        fixed: `import { A, type B } from "x";\nexport const u = [A];\nexport type T = B;`,
        name: "typeKeywordIgnoredInOrder",
        source: `import { type B, A } from "x";\nexport const u = [A];\nexport type T = B;`,
        violations: 1,
      },
      { name: "namespaceImport", source: `import * as ns from "x";\nexport const u = [ns];`, violations: 0 },
      {
        fixed: `import {
  a,
  b, // about b
} from "x";
export { a, b };`,
        name: "trailingCommentStaysWithItem",
        source: `import {
  b, // about b
  a,
} from "x";
export { a, b };`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-named-imports"],
  });
});
