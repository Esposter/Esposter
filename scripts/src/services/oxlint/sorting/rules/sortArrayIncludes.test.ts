import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortArrayIncludes", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export const v = [1, 2].includes(x);`,
        name: "unsortedNumbers",
        source: `export const v = [2, 1].includes(x);`,
        violations: 1,
      },
      { name: "sortedNumbers", source: `export const v = [1, 2].includes(x);`, violations: 0 },
      {
        fixed: `export const v = ["a", "b"].includes(x);`,
        name: "unsortedStrings",
        source: `export const v = ["b", "a"].includes(x);`,
        violations: 1,
      },
      { name: "identifierElements", source: `export const v = [a, b].includes(x);`, violations: 0 },
      {
        fixed: `export const v = [a, b].includes(x);`,
        name: "identifierElementsOutOfOrder",
        source: `export const v = [b, a].includes(x);`,
        violations: 1,
      },
      {
        name: "spreadSeparatesRuns",
        source: `export const xs = [0];\nexport const v = [1, ...xs, 0].includes(x);`,
        violations: 0,
      },
      {
        fixed: `export const xs = [0];\nexport const v = [...xs, 1, 2].includes(x);`,
        name: "spreadStartsRun",
        source: `export const xs = [0];\nexport const v = [...xs, 2, 1].includes(x);`,
        violations: 1,
      },
      {
        fixed: `export const v = new Array(1, 2).includes(x);`,
        name: "newArrayReceiver",
        source: `export const v = new Array(2, 1).includes(x);`,
        violations: 1,
      },
      { name: "notIncludes", source: `export const v = [2, 1].map(f);`, violations: 0 },
      { name: "plainArray", source: `export const v = [2, 1];`, violations: 0 },
      { name: "impureElementKeepsItsPlace", source: `export const found = [next(), 1].includes(x);`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-array-includes"],
  });
});
