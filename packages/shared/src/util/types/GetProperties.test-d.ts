import type { GetProperties } from "#src/util/types/GetProperties";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("getProperties type", () => {
  // A table row: its two key properties, and an index signature its other properties sit under
  type TableEntity<T extends object> = { [key: string]: unknown; partitionKey: string; rowKey: string } & T;

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
      { path: "a.b.length"; value: number } | { path: "a.b"; value: unknown[] } | { path: "a"; value: { b: unknown[] } }
    >();
  });

  test("nullable", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<null | string | undefined>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("non-string primitives", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<bigint | boolean | null | number | undefined>>().toEqualTypeOf<never>();
  });

  test("object", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ "": string; function: () => void }>>().toEqualTypeOf<
      { path: ".length"; value: number } | { path: ""; value: string }
    >();
  });

  test("string", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<string>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("symbol", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<symbol>>().toEqualTypeOf<
      | { path: "description.length"; value: number }
      | {
          path: "description";
          // oxlint-disable-next-line selector-ban/no-restricted-syntax -- mirrors GetPrimitiveProps' output exactly
          value: string | undefined;
        }
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
      | { path: "partitionKey.length"; value: number }
      | { path: "partitionKey"; value: string }
      | { path: "rowKey.length"; value: number }
      | { path: "rowKey"; value: string }
    >();
  });
});
