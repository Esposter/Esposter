import type { DeepOmitByPath } from "#shared/util/types/DeepOmitByPath";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("deepOmitByPath type", () => {
  test("omits top-level key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<{ a: string; b: number }, "a">>().toEqualTypeOf<{ b: number }>();
  });

  test("omits nested key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<{ a: { b: string; c: number } }, "a.b">>().toEqualTypeOf<{ a: { c: number } }>();
  });

  test("omits deeply nested key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<{ a: { b: { c: { d: string; e: number } } } }, "a.b.c.d">>().toEqualTypeOf<{
      a: { b: { c: { e: number } } };
    }>();
  });

  test("omits key from array elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<Array<{ id: string; value: number }>, "value">>().toEqualTypeOf<
      Array<{ id: string }>
    >();
  });

  test("omits key from tuple elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<[{ id: string }, { value: number }], "value">>().toEqualTypeOf<[{ id: string }, {}]>();
  });

  test("handles non-existent path", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmitByPath<{ a: string }, "a.b">>().toEqualTypeOf<{ a: string }>();
  });
});
