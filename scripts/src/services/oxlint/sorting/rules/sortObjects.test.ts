import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortObjects", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export const x = { a: 1, b: 2 };`,
        name: "unsortedObject",
        source: `export const x = { b: 2, a: 1 };`,
        violations: 1,
      },
      { name: "sortedObject", source: `export const x = { a: 1, b: 2 };`, violations: 0 },
      {
        fixed: `export const x = { a: 1, b: 2, ...rest, c: 3, d: 4 };`,
        name: "spreadPartitions",
        source: `export const x = { b: 2, a: 1, ...rest, d: 4, c: 3 };`,
        violations: 2,
      },
      {
        fixed: `export const x = { a: { d: 2, c: 1 }, b: 2 };`,
        name: "nestedObjects",
        source: `export const x = { b: 2, a: { d: 2, c: 1 } };`,
        violations: 2,
      },
      {
        fixed: `export const FooMap = { a: 1, b: 2 } as const;`,
        name: "numericSetByValue",
        source: `export const FooMap = { b: 2, a: 1 } as const;`,
        violations: 1,
      },
      {
        name: "numericSetInValueOrder",
        source: `export const FooMap = { c: 1, a: 2, b: 10 } as const;`,
        violations: 0,
      },
      {
        fixed: `export const FooMap = { b: -1, a: 1 } as const;`,
        name: "numericSetNegativeByValue",
        source: `export const FooMap = { a: 1, b: -1 } as const;`,
        violations: 1,
      },
      {
        fixed: `export const fooMap = { a: 1, b: 2 } as const;`,
        name: "lowercaseNumericSetByName",
        source: `export const fooMap = { b: 2, a: 1 } as const;`,
        violations: 1,
      },
      {
        name: "numericSetNegativeOrder",
        source: `export const FooMap = { a: -10, b: -9, c: 9, d: 10 } as const;`,
        violations: 0,
      },
      {
        fixed: `export const FooMap = { b: 1.25, a: 1.5 } as const;`,
        name: "numericSetDecimals",
        source: `export const FooMap = { a: 1.5, b: 1.25 } as const;`,
        violations: 1,
      },
      {
        fixed: `export const o = {\n  // oxlint-disable-next-line sorting/sort-objects -- order\n  b: 1,\n  a: 2,\n};`,
        name: "disabledLineStaysInPlace",
        source: `export const o = {\n  // oxlint-disable-next-line sorting/sort-objects -- order\n  b: 1,\n  a: 2,\n};`,
        violations: 1,
      },
      {
        name: "defineCommandKeepsOrder",
        source: `export const command = defineCommand({ b: 1, a: 2 });`,
        violations: 0,
      },
      {
        name: "defineCommandDeepKeepsOrder",
        source: `export const command = defineCommand({ args: { b: 1, a: 2 }, run: () => ({ d: 1, c: 2 }) });`,
        violations: 0,
      },
      { name: "argsKeepsOrder", source: `export const fooArgs = { b: 1, a: 2 };`, violations: 0 },
      { name: "argsInCallSorts", source: `export const fooArgs = makeArgs({ b: 1, a: 2 });`, violations: 1 },
      {
        fixed: `export const { a, b } = source;`,
        name: "unsortedPattern",
        source: `export const { b, a } = source;`,
        violations: 1,
      },
      {
        fixed: `export const { c = 1, a = c } = source;`,
        name: "patternDefaultReadsLaterBinding",
        source: `export const { a = c, c = 1 } = source;`,
        violations: 1,
      },
      { name: "patternDeferredReadIgnored", source: `export const { a = () => c, c = 1 } = source;`, violations: 0 },
      {
        fixed: `export const CountMap = { b: 1 + 0, a: 2 } as const;`,
        name: "numericSetWithComputedValueByValue",
        source: `export const CountMap = { a: 2, b: 1 + 0 } as const;`,
        violations: 1,
      },
      { name: "impureValueKeepsItsPlace", source: `export const o = { b: next(), a: 1 };`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-objects"],
  });
});
