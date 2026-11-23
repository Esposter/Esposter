import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortMaps", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export const m = new Map([["a", 2], ["b", 1]]);`,
        name: "unsortedKeys",
        source: `export const m = new Map([["b", 1], ["a", 2]]);`,
        violations: 1,
      },
      { name: "sortedKeys", source: `export const m = new Map([["a", 1], ["b", 2]]);`, violations: 0 },
      {
        fixed: `export const m = new Map([[k1, 2], [k2, 1]]);`,
        name: "identifierKeys",
        source: `export const m = new Map([[k2, 1], [k1, 2]]);`,
        violations: 1,
      },
      {
        name: "spreadSeparatesRuns",
        source: `export const xs = [];\nexport const m = new Map([["b", 1], ...xs, ["a", 2]]);`,
        violations: 0,
      },
      {
        fixed: `export const m = new Map([a, b]);`,
        name: "entriesNotArrays",
        source: `export const m = new Map([b, a]);`,
        violations: 1,
      },
      { name: "notArgumentArray", source: `export const m = new Map(entries);`, violations: 0 },
      { name: "otherConstructor", source: `export const m = new Foo([["b", 1], ["a", 2]]);`, violations: 0 },
      { name: "impureKeysKeepTheirPlaces", source: `export const m = new Map([[g(), 1], [f(), 2]]);`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-maps"],
  });
});
