import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("recursiveGetProperties type", () => {
  test("array", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<unknown[]>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("bigint", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<bigint>>().toEqualTypeOf<never>();
  });

  test("boolean", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<boolean>>().toEqualTypeOf<never>();
  });

  test("date", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<Date>>().toEqualTypeOf<never>();
  });

  test("nested", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<{ a: { b: unknown[] } }>>().toEqualTypeOf<
      | {
          path: "a";
          value: { b: unknown[] };
        }
      | {
          path: "a.b";
          value: unknown[];
        }
      | {
          path: "a.b.length";
          value: number;
        }
    >();
  });

  test("null", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<null>>().toEqualTypeOf<never>();
  });

  test("nullable", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<null | string | undefined>>().toEqualTypeOf<{
      path: "length";
      value: number;
    }>();
  });

  test("number", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<number>>().toEqualTypeOf<never>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<{ "": string; function: Function }>>().toEqualTypeOf<
      { path: ""; value: string } | { path: ".length"; value: number }
    >();
  });

  test("string", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<string>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("symbol", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<symbol>>().toEqualTypeOf<
      | {
          path: "description";
          value: string | undefined;
        }
      | {
          path: "description.length";
          value: number;
        }
    >();
  });

  test("tuple", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<[number]>>().toEqualTypeOf<{ path: "length"; value: 1 }>();
  });

  test("undefined", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<undefined>>().toEqualTypeOf<never>();
  });

  test("union", () => {
    expect.hasAssertions();

    expectTypeOf<RecursiveGetProperties<number | string>>().toEqualTypeOf<never>();
  });
});
