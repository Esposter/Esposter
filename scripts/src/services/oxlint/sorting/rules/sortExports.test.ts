import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortExports", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export * from "./a";\nexport * from "./b";`,
        name: "unsortedWildcards",
        source: `export * from "./b";\nexport * from "./a";`,
        violations: 1,
      },
      { name: "sortedWildcards", source: `export * from "./a";\nexport * from "./b";`, violations: 0 },
      {
        fixed: `export * from "./a";\nexport * from "./b";\nexport * from "./c";`,
        name: "middleOutOfOrder",
        source: `export * from "./c";\nexport * from "./a";\nexport * from "./b";`,
        violations: 1,
      },
      {
        fixed: `export { a } from "./a";\nexport * from "./b";`,
        name: "mixedNamedAndWildcard",
        source: `export * from "./b";\nexport { a } from "./a";`,
        violations: 1,
      },
      {
        fixed: `export * from "./c";\nexport * from "./d";\nexport const e = 1;\nexport * from "./a";\nexport * from "./b";`,
        name: "declarationSplitsRuns",
        source: `export * from "./d";\nexport * from "./c";\nexport const e = 1;\nexport * from "./b";\nexport * from "./a";`,
        violations: 2,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-exports"],
  });
});
