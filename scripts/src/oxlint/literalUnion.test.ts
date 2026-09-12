import { setupPluginSuite } from "#src/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

const RULE = "literal-union/no-string-literal-union";

describe("literal-union", () => {
  // Every fixture exports what it declares, so the correctness category oxlint keeps on reports nothing else.
  const FIXTURES = [
    { name: "twoStrings", source: `export type Union = "a" | "b";`, violations: 1 },
    { name: "threeStrings", source: `export type Union = "a" | "b" | "c";`, violations: 1 },
    { name: "parameterAnnotation", source: `export const f = (axis: "x" | "y") => axis;`, violations: 1 },
    { name: "propertyAnnotation", source: `export interface Foo { variant: "plain" | "tonal" }`, violations: 1 },
    { name: "returnAnnotation", source: `export const f = (): "x" | "y" => "x";`, violations: 1 },
    { name: "parenthesizedArray", source: `export type Axes = ("x" | "y")[];`, violations: 1 },
    // Two string literals stay a set however many other members sit beside them.
    { name: "stringsBesideEnum", source: `export type Union = "" | "null" | Foo;`, violations: 1 },
    // One string literal beside other types is a sentinel or a discriminant, not a set.
    { name: "emptySentinel", source: `export type Union = "" | Foo;`, violations: 0 },
    { name: "stringBesideNumber", source: `export type Union = "a" | 1;`, violations: 0 },
    { name: "singleLiteral", source: `export type Single = "a";`, violations: 0 },
    { name: "numericUnion", source: `export type Union = -1 | 1;`, violations: 0 },
    { name: "enumUnion", source: `export type Union = Foo | Bar;`, violations: 0 },
    // A template literal type is a pattern rather than a member of a set.
    { name: "templateLiteral", source: "export type Union = `a` | `b`;", violations: 0 },
    // A union handed to a generic names keys or narrows a parameter the compiler checks against its target.
    { name: "pickKeys", source: `export type Summary = Pick<Foo, "id" | "name">;`, violations: 0 },
    { name: "genericArgument", source: `export const value = ref<"a" | "b">("a");`, violations: 0 },
  ];
  const { getCodes, getViolations } = setupPluginSuite({ fixtures: FIXTURES, plugin: "literalUnion", rules: [RULE] });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())]).toStrictEqual(["literal-union(no-string-literal-union)"]);
  });
});
