import type { DeepOptionalUndefined } from "@/util/types/DeepOptionalUndefined";
import type { Primitive } from "type-fest";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("deepOptionalUndefined type", () => {
  test("retains type", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOptionalUndefined<Date | Primitive | Record<string, unknown>>>().toEqualTypeOf<
      Date | Primitive | Record<string, unknown>
    >();
  });

  test("retains nested type", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOptionalUndefined<{ "": Date | Primitive | Record<string, unknown> }>>().toEqualTypeOf<{
      ""?: Date | Primitive | Record<string, unknown>;
    }>();
  });

  test("optionalizes property", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOptionalUndefined<{ "": undefined | unknown }>>().toEqualTypeOf<{ ""?: unknown }>();
  });

  test("optionalizes nested property", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOptionalUndefined<{ "": { "": undefined | unknown } }>>().toEqualTypeOf<{
      "": { ""?: unknown };
    }>();
  });
});
