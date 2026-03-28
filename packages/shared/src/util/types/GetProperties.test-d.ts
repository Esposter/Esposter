import type { GetProperties } from "@/util/types/GetProperties";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("getProperties type", () => {
  type TableEntity<T extends object = Record<string, unknown>> = T & {
    partitionKey: string;
    rowKey: string;
  };

  test("array", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<unknown[]>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("bigint", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<bigint>>().toEqualTypeOf<never>();
  });

  test("boolean", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<boolean>>().toEqualTypeOf<never>();
  });

  test("date", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<Date>>().toEqualTypeOf<never>();
  });

  test("nested", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ a: { b: unknown[] } }>>().toEqualTypeOf<
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

    expectTypeOf<GetProperties<null>>().toEqualTypeOf<never>();
  });

  test("nullable", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<null | string | undefined>>().toEqualTypeOf<{
      path: "length";
      value: number;
    }>();
  });

  test("number", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<number>>().toEqualTypeOf<never>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ "": string; function: Function }>>().toEqualTypeOf<
      { path: ""; value: string } | { path: ".length"; value: number }
    >();
  });

  test("string", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<string>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("symbol", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<symbol>>().toEqualTypeOf<
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

    expectTypeOf<GetProperties<[number]>>().toEqualTypeOf<{ path: "length"; value: 1 }>();
  });

  test("undefined", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<undefined>>().toEqualTypeOf<never>();
  });

  test("union", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<number | string>>().toEqualTypeOf<never>();
  });

  test("tableEntity", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<TableEntity<{ "": number }>>>().toEqualTypeOf<
      | { path: ""; value: number }
      | { path: "partitionKey"; value: string }
      | { path: "partitionKey.length"; value: number }
      | { path: "rowKey"; value: string }
      | { path: "rowKey.length"; value: number }
    >();
  });
});
