import type { GetPaths } from "#src/util/types/GetPaths";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("getPaths type", () => {
  test("retains type", () => {
    expect.hasAssertions();

    expectTypeOf<GetPaths<{ a: string }>>().toEqualTypeOf<"a" | "a.length">();
  });

  test("retains nested type", () => {
    expect.hasAssertions();

    expectTypeOf<GetPaths<{ a: { b: string } }>>().toEqualTypeOf<"a" | "a.b" | "a.b.length">();
  });

  test("tableEntity should keep the literal keys even if type has an index signature", () => {
    expect.hasAssertions();

    type TableEntity = { [key: string]: unknown; partitionKey: string; rowKey: string };
    expectTypeOf<GetPaths<TableEntity>>().toEqualTypeOf<
      "partitionKey" | "partitionKey.length" | "rowKey" | "rowKey.length"
    >();
  });
});
