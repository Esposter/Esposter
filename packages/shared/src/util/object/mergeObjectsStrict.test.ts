import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { describe, expect, test } from "vitest";

describe(mergeObjectsStrict, () => {
  test("merges objects", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ a: 0 }, { b: 1 })).toStrictEqual({ a: 0, b: 1 });
  });

  test("overwrites properties", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ a: 0 }, { a: 1 })).toStrictEqual({ a: 1 });
  });
});
