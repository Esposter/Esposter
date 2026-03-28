import type { RecursiveDeepOmit } from "#shared/util/types/RecursiveDeepOmit";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("recursiveDeepOmit type", () => {
  test("omits single top-level key", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: string; b: number; c: boolean }, ["a"]>>().toEqualTypeOf<{
      b: number;
      c: boolean;
    }>();
  });

  test("omits multiple top-level keys", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: string; b: number; c: boolean; d: Date }, ["a", "c"]>>().toEqualTypeOf<{
      b: number;
      d: Date;
    }>();
  });

  test("omits nested key", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: { b: string; c: number }; d: boolean }, ["a.b"]>>().toEqualTypeOf<{
      a: { c: number };
      d: boolean;
    }>();
  });

  test("omits deeply nested key", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: { b: { c: { d: string; e: number } } } }, ["a.b.c.d"]>>().toEqualTypeOf<{
      a: { b: { c: { e: number } } };
    }>();
  });

  test("omits multiple nested keys", () => {
    expect.hasAssertions();

    expectTypeOf<
      RecursiveDeepOmit<{ a: { b: string; c: number }; d: { e: boolean; f: Date } }, ["a.b", "d.f"]>
    >().toEqualTypeOf<{ a: { c: number }; d: { e: boolean } }>();
  });

  test("omits key from array elements", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ items: { id: string; value: number }[] }, ["items.value"]>>().toEqualTypeOf<{
      items: { id: string }[];
    }>();
  });

  test("omits key from tuple elements", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ data: [{ id: string }, { value: number }] }, ["data.value"]>>().toEqualTypeOf<{
      data: [{ id: string }, {}];
    }>();
  });

  test("handles empty keys array", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: string; b: number }, []>>().toEqualTypeOf<{ a: string; b: number }>();
  });

  test("omits key that doesn't exist", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveDeepOmit<{ a: string; b: number }, ["c"]>>().toEqualTypeOf<{ a: string; b: number }>();
  });

  test("preserves excluded types", () => {
    expect.hasAssertions();

    expectTypeOf<
      RecursiveDeepOmit<
        { a: Date; b: () => void; c: RegExp; d: Map<string, number>; e: Set<string> },
        ["a", "b", "c", "d", "e"]
      >
    >().toEqualTypeOf<{}>();
  });
});
