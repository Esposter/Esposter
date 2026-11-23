import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortVariableDeclarations", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export let a = 2, b = 1;`,
        name: "unsortedDeclarators",
        source: `export let b = 1, a = 2;`,
        violations: 1,
      },
      { name: "sortedDeclarators", source: `export let a = 2, b = 1;`, violations: 0 },
      { name: "readOfEarlierDeclaratorSorted", source: `export const x = 1, y = x + 1;`, violations: 0 },
      { name: "readPullsProviderAhead", source: `export const b = 1, a = b;`, violations: 0 },
      {
        fixed: `export const b = 1, a = b;`,
        name: "readOfLaterDeclaratorIsDependency",
        source: `export const a = b, b = 1;`,
        violations: 1,
      },
      { name: "readInsideDeferredFunctionIgnored", source: `export const a = () => b, b = 1;`, violations: 0 },
      { name: "readInsideImmediateCallIsDependency", source: `export const a = (() => b)(), b = 1;`, violations: 1 },
      { name: "readInsideCallbackIsDependency", source: `export const a = f(() => b), b = 1;`, violations: 1 },
      { name: "circularDependencies", source: `export const a = b, b = a;`, violations: 0 },
      { name: "dependencyChain", source: `export const c = b, b = a, a = 1;`, violations: 2 },
      { name: "patternDeclaratorBeforeReader", source: `export const { x } = o, y = x;`, violations: 0 },
      {
        fixed: `export let a = 1, b: number = 2;`,
        name: "annotatedDeclarators",
        source: `export let b: number = 2, a = 1;`,
        violations: 1,
      },
      { name: "impureInitialiserKeepsItsPlace", source: `export const z = next(), a = next();`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-variable-declarations"],
  });
});
