import type { DeepOmit } from "#src/util/types/DeepOmit";
import type { Primitive } from "type-fest";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("deepOmit type", () => {
  test("omits top-level key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: string; b: number }, "a">>().toEqualTypeOf<{ b: number }>();
  });

  test("omits nested key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: string; c: number } }, "b">>().toEqualTypeOf<{ a: { c: number } }>();
  });

  test("preserves union with primitive and index signature when omitting different key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: Date | Primitive | Record<string, unknown>; b: unknown }, "b">>().toEqualTypeOf<{
      a: Date | Primitive | Record<string, unknown>;
    }>();
  });

  test("preserves nested union types when omitting different key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: Date | Primitive | Record<string, unknown> }; c: unknown }, "c">>().toEqualTypeOf<{
      a: { b: Date | Primitive | Record<string, unknown> };
    }>();
  });

  test("omits key from array elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: string; c: boolean }[] }, "c">>().toEqualTypeOf<{ a: { b: string }[] }>();
  });

  test("omits key from tuple elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: [{ b: string }, { c: number; d: boolean }] }, "c">>().toEqualTypeOf<{
      a: [{ b: string }, { d: boolean }];
    }>();
  });

  test("omits nested key in object with nested structure", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: { c: string; d: number } } }, "d">>().toEqualTypeOf<{ a: { b: { c: string } } }>();
  });

  test("preserves Date when omitting its key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: Date; b: string }, "b">>().toEqualTypeOf<{ a: Date }>();
  });

  test("preserves Date in nested object when omitting different key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: Date }; c: string }, "c">>().toEqualTypeOf<{ a: { b: Date } }>();
  });

  test("preserves Function when omitting its key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: () => void; b: string }, "b">>().toEqualTypeOf<{ a: () => void }>();
  });

  test("preserves Primitive types when omitting their keys", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: string; b: number; c: boolean; d: string }, "d">>().toEqualTypeOf<{
      a: string;
      b: number;
      c: boolean;
    }>();
  });

  test("omits key from array of objects at depth", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: string; c: string; d: string; e: string }[] }, "c">>().toEqualTypeOf<{
      a: { b: string; d: string; e: string }[];
    }>();
  });

  test("omits key at multiple nesting levels", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: { c: { d: string; e: number } } } }, "d">>().toEqualTypeOf<{
      a: { b: { c: { e: number } } };
    }>();
  });
});
