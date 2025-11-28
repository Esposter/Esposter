import type { GetProperties } from "#shared/util/types/GetProperties";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("getProperties type", () => {
  test("string", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<string>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("number", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<number>>().toEqualTypeOf<never>();
  });

  test("boolean", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<boolean>>().toEqualTypeOf<never>();
  });

  test("null", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<null>>().toEqualTypeOf<never>();
  });

  test("undefined", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<undefined>>().toEqualTypeOf<never>();
  });

  test("symbol", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<symbol>>().toEqualTypeOf<{ path: "description"; value: string | undefined }>();
  });

  test("bigint", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<bigint>>().toEqualTypeOf<never>();
  });

  test("array", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<string[]>>().toEqualTypeOf<{ path: "length"; value: number }>();
  });

  test("object with string property", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ "": string }>>().toEqualTypeOf<{ path: ""; value: string }>();
  });

  test("excludes function properties", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ getName: () => string; name: string }>>().toEqualTypeOf<{
      path: "name";
      value: string;
    }>();
  });

  test("excludes numeric index properties", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<[number]>>().toEqualTypeOf<{ path: "length"; value: 1 }>();
  });

  test("date", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<Date>>().toEqualTypeOf<never>();
  });

  test("union types", () => {
    expect.hasAssertions();

    type StringOrNumber = number | string;

    expectTypeOf<GetProperties<StringOrNumber>>().toEqualTypeOf<never>();
  });

  test("optional properties", () => {
    expect.hasAssertions();

    expectTypeOf<GetProperties<{ ""?: string }>>().toEqualTypeOf<{ path: ""; value: string | undefined }>();
  });
});
