import type { PropertyPathValue } from "#shared/models/achievement/type/PropertyPathValue";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("propertyPathValue type", () => {
  test("string and array expose a length path", () => {
    expect.hasAssertions();

    expectTypeOf<PropertyPathValue<{ files: string[]; message: string }>>().toEqualTypeOf<
      | { path: "files"; value: string[] }
      | { path: "files.length"; value: number }
      | { path: "message"; value: string }
      | { path: "message.length"; value: number }
    >();
  });

  test("nested path", () => {
    expect.hasAssertions();

    expectTypeOf<PropertyPathValue<{ data: { pointCount: number } }>>().toEqualTypeOf<
      { path: "data"; value: { pointCount: number } } | { path: "data.pointCount"; value: number }
    >();
  });

  test("optional intermediate keeps undefined in the value", () => {
    expect.hasAssertions();

    expectTypeOf<PropertyPathValue<{ data?: { pointCount: number } }>>().toEqualTypeOf<
      | { path: "data"; value: { pointCount: number } | undefined }
      | { path: "data.pointCount"; value: number | undefined }
    >();
  });

  test("a number gets no length path", () => {
    expect.hasAssertions();

    expectTypeOf<PropertyPathValue<{ value: number }>["path"]>().toEqualTypeOf<"value">();
  });
});
