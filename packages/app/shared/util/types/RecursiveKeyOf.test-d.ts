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

  test("excludes array keys", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: string[] }>>().toEqualTypeOf<"a">();
  });

  test("excludes Date", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: Date }>>().toEqualTypeOf<"a">();
  });

  test("excludes Function", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: () => void }>>().toEqualTypeOf<"a">();
  });

  test("excludes RegExp", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: RegExp }>>().toEqualTypeOf<"a">();
  });

  test("excludes Map", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: Map<string, number> }>>().toEqualTypeOf<"a">();
  });

  test("excludes Set", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: Set<string> }>>().toEqualTypeOf<"a">();
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
    >().toEqualTypeOf<"a" | "b" | "c" | "d" | "e" | "f" | "g" | "h">();
  });

  test("excludes nested excluded types but includes their parent keys", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: { b: Date; c: { d: string } } }>>().toEqualTypeOf<"a" | "b" | "c" | "d">();
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
