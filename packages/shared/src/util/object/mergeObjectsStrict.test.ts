import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { describe, expect, test } from "vitest";

describe(mergeObjectsStrict, () => {
  test("merges objects", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ "": "" }, { " ": " " })).toStrictEqual({ "": "", " ": " " });
  });

  test("overwrites properties", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ "": "" }, { "": " " })).toStrictEqual({ "": " " });
  });
});
