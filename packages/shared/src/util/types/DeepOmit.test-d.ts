import type { DeepOmit } from "@/util/types/DeepOmit";
import type { Primitive } from "type-fest";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("deepOmit type", () => {
  test("omits top-level key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: string; b: number }, "a">>().toEqualTypeOf<{ b: number }>();
  });

  test("omits nested key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: string } }, "b">>().toEqualTypeOf<{ a: {} }>();
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

    expectTypeOf<DeepOmit<{ a: Array<{ b: string; c: boolean }> }, "c">>().toEqualTypeOf<{
      a: Array<{ b: string }>;
    }>();
  });

  test("omits key from tuple elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: [{ b: string }, { c: number }] }, "c">>().toEqualTypeOf<{
      a: [{ b: string }, {}];
    }>();
  });

  test("omits nested key in object with nested structure", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: { c: string; d: number } } }, "d">>().toEqualTypeOf<{
      a: { b: { c: string } };
    }>();
  });

  test("preserves Date when omitting its key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: Date }, "a">>().toEqualTypeOf<{}>();
  });

  test("preserves Date in nested object when omitting different key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: Date }; c: string }, "c">>().toEqualTypeOf<{
      a: { b: Date };
    }>();
  });

  test("preserves Function when omitting its key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: () => void }, "a">>().toEqualTypeOf<{}>();
  });

  test("preserves Primitive types when omitting their keys", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: string }, "a">>().toEqualTypeOf<{}>();
    expectTypeOf<DeepOmit<{ a: number }, "a">>().toEqualTypeOf<{}>();
    expectTypeOf<DeepOmit<{ a: boolean }, "a">>().toEqualTypeOf<{}>();
  });

  test("omits key from array of objects at depth", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: Array<{ b: string; c: string; d: string; e: string }> }, "c">>().toEqualTypeOf<{
      a: Array<{ b: string; d: string; e: string }>;
    }>();
  });

  test("omits key at multiple nesting levels", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: { c: { d: string; e: number } } } }, "d">>().toEqualTypeOf<{
      a: { b: { c: { e: number } } };
    }>();
  });
});
