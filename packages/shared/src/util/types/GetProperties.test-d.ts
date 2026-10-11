import type { GetProperties } from "#src/util/types/GetProperties";
import type { TableEntity } from "@azure/data-tables";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("getProperties type", () => {
  test("array", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<unknown[]>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("date", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<Date>>().toEqualTypeOf<never>();
  });

  test("nested", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ a: { b: unknown[] } }>>().toEqualTypeOf<
      { path: "a"; value: { b: unknown[] } } | { path: "a.b"; value: unknown[] } | { path: "a.b.length"; value: number }
    >();
  });

  test("nullable", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<null | string | undefined>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("non-string primitives", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<bigint | boolean | number | null | undefined>>().toEqualTypeOf<never>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ "": string; function: () => void }>>().toEqualTypeOf<
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
          // eslint-disable-next-line no-restricted-syntax -- mirrors GetPrimitiveProps' emitted shape exactly
          value: string | undefined;
        }
      | { path: "description.length"; value: number }
    >();
  });

  test("tuple", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<[number]>>().toEqualTypeOf<{ path: "length"; value: 1 }>();
  });

  test("union", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<number | string>>().toEqualTypeOf<{ path: "length"; value: number }>();
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
