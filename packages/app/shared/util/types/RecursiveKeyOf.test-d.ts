import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("recursiveKeyOf test", () => {
  test("returns keys from simple object", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: string; b: number }>>().toEqualTypeOf<"a" | "b">();
  });

  test("returns nested keys without dot notation", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: { b: string; c: { d: number } } }>>().toEqualTypeOf<"a" | "b" | "c" | "d">();
  });

  test("includes Date methods and properties", () => {
    expect.hasAssertions();

    // Date objects have methods like getTime, toISOString, etc.
    expectTypeOf<RecursiveKeyOf<{ a: Date }>>().toEqualTypeOf<"a" | keyof Date>();
  });

  test("includes RegExp properties", () => {
    expect.hasAssertions();

    // RegExp has properties like test, exec, etc.
    expectTypeOf<RecursiveKeyOf<{ a: RegExp }>>().toEqualTypeOf<"a" | keyof RegExp>();
  });

  test("includes Map properties", () => {
    expect.hasAssertions();

    // Map has methods like set, get, etc.
    expectTypeOf<RecursiveKeyOf<{ a: Map<string, number> }>>().toEqualTypeOf<"a" | keyof Map<string, number>>();
  });

  test("includes Set properties", () => {
    expect.hasAssertions();

    // Set has methods like add, delete, etc.
    expectTypeOf<RecursiveKeyOf<{ a: Set<string> }>>().toEqualTypeOf<"a" | keyof Set<string>>();
  });

  test("returns all nested keys including deeply nested", () => {
    expect.hasAssertions();

    expectTypeOf<
      RecursiveKeyOf<{
        a: {
          b: {
            c: {
              d: string;
              e: number;
            };
            f: boolean;
          };
          g: Date;
        };
        h: string;
      }>
    >().toEqualTypeOf<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | keyof Date>();
  });

  test("includes nested excluded types properties", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: { b: Date; c: { d: string } } }>>().toEqualTypeOf<
      "a" | "b" | "c" | "d" | keyof Date
    >();
  });

  test("returns never for empty object", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{}>>().toEqualTypeOf<never>();
  });

  test("returns never for primitive", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<string>>().toEqualTypeOf<never>();
    expectTypeOf<RecursiveKeyOf<number>>().toEqualTypeOf<never>();
    expectTypeOf<RecursiveKeyOf<boolean>>().toEqualTypeOf<never>();
  });

  test("handles empty string keys", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ "": string; " ": { "  ": number } }>>().toEqualTypeOf<"" | " " | "  ">();
  });
});
