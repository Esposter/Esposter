import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortImportAttributes", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `import data from "./d.json" with { a: "x", type: "json" };\nexport const u = data;`,
        name: "unsortedAttributes",
        source: `import data from "./d.json" with { type: "json", a: "x" };\nexport const u = data;`,
        violations: 1,
      },
      {
        name: "sortedAttributes",
        source: `import data from "./d.json" with { a: "x", type: "json" };\nexport const u = data;`,
        violations: 0,
      },
      {
        fixed: `import data from "./d.json" with { "a": "2", "b": "1" };\nexport const u = data;`,
        name: "stringKeys",
        source: `import data from "./d.json" with { "b": "1", "a": "2" };\nexport const u = data;`,
        violations: 1,
      },
      { name: "noAttributes", source: `import data from "./d.json";\nexport const u = data;`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-import-attributes"],
  });
});
