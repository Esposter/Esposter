import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("getSynchronizedFunction type", () => {
  test("returns void instead of the original promise", () => {
    expect.hasAssertions();

    expectTypeOf(getSynchronizedFunction<[string]>).returns.returns.toEqualTypeOf<void>();
  });

  test("forwards the original parameters", () => {
    expect.hasAssertions();

    expectTypeOf(getSynchronizedFunction<[number, string]>).returns.parameters.toEqualTypeOf<[number, string]>();
  });
});
