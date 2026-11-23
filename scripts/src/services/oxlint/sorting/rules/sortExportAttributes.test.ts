import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortExportAttributes", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export { default } from "./d.json" with { a: "x", type: "json" };`,
        name: "unsortedAttributes",
        source: `export { default } from "./d.json" with { type: "json", a: "x" };`,
        violations: 1,
      },
      {
        name: "sortedAttributes",
        source: `export { default } from "./d.json" with { a: "x", type: "json" };`,
        violations: 0,
      },
      {
        name: "wildcardExportNotSorted",
        source: `export * from "./d.json" with { type: "json", a: "x" };`,
        violations: 0,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-export-attributes"],
  });
});
