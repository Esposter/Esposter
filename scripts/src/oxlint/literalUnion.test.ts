import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("literalUnion", () => {
  const RULE = "literal-union/no-string-literal-union";
  // Every fixture exports what it declares, so the correctness category oxlint keeps on reports nothing else.
  const FIXTURES = [
    { name: "twoStrings", source: `export type X = "a" | "b";`, violations: 1 },
    { name: "threeStrings", source: `export type X = "a" | "b" | "c";`, violations: 1 },
    { name: "parameterAnnotation", source: `export const f = (a: "x" | "y") => a;`, violations: 1 },
    { name: "propertyAnnotation", source: `export interface X { a: "a" | "b" }`, violations: 1 },
    { name: "returnAnnotation", source: `export const f = (): "x" | "y" => "x";`, violations: 1 },
    { name: "parenthesizedArray", source: `export type X = ("x" | "y")[];`, violations: 1 },
    // Two string literals stay a set however many other members sit beside them.
    { name: "stringsBesideEnum", source: `export type X = "" | "a" | Y;`, violations: 1 },
    // One string literal beside other types is a sentinel or a discriminant, not a set.
    { name: "emptySentinel", source: `export type X = "" | Y;`, violations: 0 },
    { name: "stringBesideNumber", source: `export type X = "a" | 1;`, violations: 0 },
    { name: "singleLiteral", source: `export type X = "a";`, violations: 0 },
    { name: "numericUnion", source: `export type X = -1 | 1;`, violations: 0 },
    { name: "enumUnion", source: `export type X = Y | T;`, violations: 0 },
    // A template literal type is a pattern rather than a member of a set.
    { name: "templateLiteral", source: "export type X = `a` | `b`;", violations: 0 },
    // A union handed to a generic names keys or narrows a parameter the compiler checks against its target.
    { name: "pickKeys", source: `export type X = Pick<Y, "a" | "b">;`, violations: 0 },
    { name: "genericArgument", source: `export const a = ref<"a" | "b">("a");`, violations: 0 },
    { name: "parenthesizedKeys", source: `export type X = Record<("a" | "b"), boolean>;`, violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "literalUnion", rules: [RULE] });
});
