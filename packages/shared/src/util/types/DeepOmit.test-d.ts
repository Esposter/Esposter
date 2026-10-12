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

  test("preserves Date in nested object when omitting different key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: Date }; c: string }, "c">>().toEqualTypeOf<{ a: { b: Date } }>();
  });

  test("preserves Function when omitting its key", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: () => void; b: string }, "b">>().toEqualTypeOf<{ a: () => void }>();
  });

  test("preserves class when omitting a key it has", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: typeof Map; b: string }, "prototype">>().toEqualTypeOf<{ a: typeof Map; b: string }>();
  });

  test("omits key at multiple nesting levels", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: { c: { d: string; e: number } } } }, "d">>().toEqualTypeOf<{
      a: { b: { c: { e: number } } };
    }>();
  });

  test("keeps a readonly array and omits key from its elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: readonly { b: string; c: number }[] }, "c">>().toEqualTypeOf<{
      a: readonly { b: string }[];
    }>();
  });

  test("keeps a readonly tuple and omits key from its elements", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: readonly [{ b: string }, { c: number; d: boolean }] }, "c">>().toEqualTypeOf<{
      a: readonly [{ b: string }, { d: boolean }];
    }>();
  });

  test("omits key from a nested array of objects", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: { b: string; c: number }[][] }, "c">>().toEqualTypeOf<{ a: { b: string }[][] }>();
  });

  test("keeps Map and Set by reference rather than walking their keys", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ a: Map<string, { c: number }>; b: Set<string>; c: number }, "c">>().toEqualTypeOf<{
      a: Map<string, { c: number }>;
      b: Set<string>;
    }>();
  });

  test("keeps Blob by reference, so its size is not omitted", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ f: Blob }, "size">>().toEqualTypeOf<{ f: Blob }>();
  });

  test("keeps an open object type such as object as it is", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ id: string; meta: object }, "id">>().toEqualTypeOf<{ meta: object }>();
  });
});
