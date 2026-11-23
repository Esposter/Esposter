import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sorting", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export type X = "a" | "b";`,
        name: "unsortedUnion",
        source: `export type X = "b" | "a";`,
        violations: 1,
      },
      { name: "sortedUnion", source: `export type X = "a" | "b" | B;`, violations: 0 },
      {
        fixed: `export type X = (A extends B ? C : D) | E;`,
        name: "unsortedParenthesizedUnionMember",
        source: `export type X = E | (A extends B ? C : D);`,
        violations: 1,
      },
      { name: "sortedParenthesizedUnionMember", source: `export type X = (A extends B ? C : D) | E;`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-union-types"],
  });
});
