import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortNamedExports", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `const a = 1;\nconst b = 2;\nexport { a, b };`,
        name: "unsortedSpecifiers",
        source: `const a = 1;\nconst b = 2;\nexport { b, a };`,
        violations: 1,
      },
      { name: "sortedSpecifiers", source: `const a = 1;\nconst b = 2;\nexport { a, b };`, violations: 0 },
      { name: "sortsByExportedName", source: `const a = 1;\nconst z = 2;\nexport { z as a, a as b };`, violations: 0 },
      {
        fixed: `const a = 1;\nconst b = 2;\nexport { b, a as z };`,
        name: "aliasChangesOrder",
        source: `const a = 1;\nconst b = 2;\nexport { a as z, b };`,
        violations: 1,
      },
      {
        fixed: `export { x, y } from "./m";`,
        name: "reExportSpecifiers",
        source: `export { y, x } from "./m";`,
        violations: 1,
      },
      {
        fixed: `export type B = 2;\nexport type A = 1;\nexport type { A, B };`,
        name: "typeExports",
        source: `export type B = 2;\nexport type A = 1;\nexport type { B, A };`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-named-exports"],
  });
});
