import type { MergeObjectsStrict } from "#src/util/types/MergeObjectsStrict";

import { describe, expect, expectTypeOf, test } from "vitest";

describe("mergeObjectsStrict type", () => {
  test("the first and last of three sets sharing a key", () => {
    expect.hasAssertions();

    expectTypeOf<MergeObjectsStrict<[{ A: "a" }, { B: "b" }, { A: "a" }]>>().toBeNever();
  });

  test("neighbouring sets sharing a key", () => {
    expect.hasAssertions();

    expectTypeOf<MergeObjectsStrict<[{ A: "a" }, { A: "a" }]>>().toBeNever();
  });

  test("sets with no key in common", () => {
    expect.hasAssertions();

    expectTypeOf<MergeObjectsStrict<[{ A: "a" }, { B: "b" }, { C: 1 }]>>().toEqualTypeOf<
      { A: "a" } & { B: "b" } & { C: 1 }
    >();
  });
});
