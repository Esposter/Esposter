import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("enumMap", () => {
  const RULE = "enum-map/no-literal-map-key";
  // Every fixture exports what it declares, so the correctness category oxlint keeps on reports nothing else.
  const FIXTURES = [
    { name: "literalKey", source: `export const FooMap = { a: 1 };`, violations: 1 },
    { name: "quotedKey", source: `export const FooMap = { "a-b": 1 };`, violations: 1 },
    // A numeric key is a dataset's id, which no enum names, so a map keyed by ids is left as it is.
    { name: "numericKey", source: `export const FooMap = { 1: "a", 10_000_027: "b" };`, violations: 0 },
    { name: "enumMemberKey", source: `export const FooMap = { [Foo.A]: 1 };`, violations: 0 },
    {
      name: "partialRecordAnnotation",
      source: `export const FooMap: Partial<Record<X, string>> = { a: "b" };`,
      violations: 1,
    },
    {
      name: "asConstSatisfiesEnumKeys",
      source: `export const FooMap = { [Foo.A]: 1 } as const satisfies Record<Foo, number>;`,
      violations: 0,
    },
    {
      name: "asConstSatisfiesLiteralKeys",
      source: `export const FooMap = { a: 1 } as const satisfies Record<Foo, number>;`,
      violations: 1,
    },
    // A map over an open set of keys has no enum to name them, so its literal keys are the set's own spelling.
    { name: "openSetAnnotation", source: `export const FooMap: Record<string, string> = { a: "b" };`, violations: 0 },
    {
      name: "openSetSatisfies",
      source: `export const FooMap = { a: "b" } as const satisfies Record<string, string>;`,
      violations: 0,
    },
    { name: "openSetAs", source: `export const FooMap = { a: "b" } as Record<string, string>;`, violations: 0 },
    {
      name: "openSetWrappedAnnotation",
      source: `export const FooMap: Partial<Readonly<Record<string, string>>> = { a: "b" };`,
      violations: 0,
    },
    // Only a constant map is checked: a lowercase object or a non-map name is not one.
    { name: "lowercaseName", source: `export const fooMap = { a: 1 };`, violations: 0 },
    { name: "notAMap", source: `export const foo = { a: 1 };`, violations: 0 },
    { name: "mapFromCall", source: `export const FooMap = new Map([["a", 1]]);`, violations: 0 },
    { name: "spreadEntries", source: `export const FooMap = { ...a, [Foo.A]: 1 };`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "enumMap", rules: [RULE] });
});
