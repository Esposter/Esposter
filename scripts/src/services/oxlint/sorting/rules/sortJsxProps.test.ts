import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortJsxProps", () => {
  setupPluginSuite({
    extension: ".tsx",
    fixtures: [
      {
        fixed: `export const C = <div a="2" b="1" />;`,
        name: "unsortedProps",
        source: `export const C = <div b="1" a="2" />;`,
        violations: 1,
      },
      { name: "sortedProps", source: `export const C = <div a="2" b="1" />;`, violations: 0 },
      {
        fixed: `export const C = <input a="1" disabled />;`,
        name: "shorthandProp",
        source: `export const C = <input disabled a="1" />;`,
        violations: 1,
      },
      {
        name: "spreadSeparatesRuns",
        source: `export const p = {};\nexport const C = <div b="1" {...p} d="1" c="2" />;`,
        violations: 1,
      },
      {
        name: "spreadStartsRunSorted",
        source: `export const p = {};\nexport const C = <div b="1" {...p} c="2" d="1" />;`,
        violations: 0,
      },
      { name: "namespacedProp", source: `export const C = <svg xlink:href="x" a="1" />;`, violations: 1 },
      { name: "impureValueKeepsItsPlace", source: `export const e = <A b={next()} a={1} />;`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-jsx-props"],
  });
});
