import type { DeepOmit } from "@/util/types/DeepOmit";
import type { Primitive } from "type-fest";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("deepOmit type", () => {
  test("omits type", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ "": unknown }, "">>().toEqualTypeOf<{}>();
  });

  test("omits nested type", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ "": { omit: unknown } }, "omit">>().toEqualTypeOf<{ "": {} }>();
  });

  test("retains type", () => {
    expect.hasAssertions();

    expectTypeOf<DeepOmit<{ "": Date | Primitive | Record<string, unknown>; omit: unknown }, "omit">>().toEqualTypeOf<{
      "": Date | Primitive | Record<string, unknown>;
    }>();
  });

  test("retains nested type", () => {
    expect.hasAssertions();

    expectTypeOf<
      DeepOmit<{ "": { "": Date | Primitive | Record<string, unknown> }; omit: unknown }, "omit">
    >().toEqualTypeOf<{
      "": { "": Date | Primitive | Record<string, unknown> };
    }>();
  });
});
