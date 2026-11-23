import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortSets", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export const s = new Set([1, 2]);`,
        name: "unsortedNumbers",
        source: `export const s = new Set([2, 1]);`,
        violations: 1,
      },
      { name: "sortedNumbers", source: `export const s = new Set([1, 2]);`, violations: 0 },
      {
        fixed: `export const s = new Set(["a", "b"]);`,
        name: "unsortedStrings",
        source: `export const s = new Set(["b", "a"]);`,
        violations: 1,
      },
      {
        fixed: `export const xs = [0];\nexport const s = new Set([...xs, 1, 2]);`,
        name: "spreadStartsRun",
        source: `export const xs = [0];\nexport const s = new Set([...xs, 2, 1]);`,
        violations: 1,
      },
      {
        name: "spreadSeparatesRuns",
        source: `export const xs = [0];\nexport const s = new Set([2, ...xs, 1]);`,
        violations: 0,
      },
      { name: "notFirstArgument", source: `export const s = new Set(1, [2, 1]);`, violations: 0 },
      { name: "otherConstructor", source: `export const s = new Foo([2, 1]);`, violations: 0 },
      { name: "plainArray", source: `export const a = [2, 1];`, violations: 0 },
      { name: "newArrayArgument", source: `export const s = new Set(new Array(2, 1));`, violations: 1 },
      { name: "impureElementStillSorts", source: `export const s = new Set([next(), 1]);`, violations: 1 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-sets"],
  });
});
