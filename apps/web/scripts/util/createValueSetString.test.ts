import { createValueSetString } from "@@/scripts/util/createValueSetString";
import { describe, expect, test } from "vitest";

describe(createValueSetString, () => {
  test("generating a set from a listing", () => {
    expect.hasAssertions();

    expect(createValueSetString("Name", ["b", "a/b", "a"])).toBe(`export const Name = {
  A: "a",
  "a/b": "a/b",
  B: "b",
} as const;
export type Name = (typeof Name)[keyof typeof Name];
`);
  });
});
