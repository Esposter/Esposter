import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("recursiveKeyOf test", () => {
  test("returns keys from simple object", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: string; b: number }>>().toEqualTypeOf<"a" | "b">();
  });

  test("returns nested paths", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: { b: string; c: { d: number } } }>>().toEqualTypeOf<
      "a" | "a.b" | "a.c" | "a.c.d"
    >();
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

  test("includes keys for nested excluded types", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveKeyOf<{ a: { b: Date; c: { d: string } } }>>().toEqualTypeOf<"a" | "a.b" | "a.c" | "a.c.d">();
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

  test("returns keys from nested structure with mixed types", () => {
    expect.hasAssertions();

    expectTypeOf<
      RecursiveKeyOf<{
        a: {
          b: string;
          c: Date;
          d: {
            e: string;
            f: RegExp;
          };
        };
        g: number;
      }>
    >().toEqualTypeOf<"a" | "a.b" | "a.c" | "a.d" | "a.d.e" | "a.d.f" | "g">();
  });
});
