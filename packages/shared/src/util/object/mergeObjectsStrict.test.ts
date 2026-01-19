import { mergeObjectsStrict } from "@/util/object/mergeObjectsStrict";
import { describe, expect, test } from "vitest";

describe(mergeObjectsStrict, () => {
  test("single", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({})).toStrictEqual({});
  });

  test("merges", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ "": "" }, { " ": " " })).toStrictEqual({ "": "", " ": " " });
  });

  test("shallow merges", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ "": { "": "" } }, { "": { " ": " " } })).toStrictEqual({ "": { " ": " " } });
  });

  test("overwrites properties", () => {
    expect.hasAssertions();

    expect(mergeObjectsStrict({ "": "" }, { "": " " })).toStrictEqual({ "": " " });
  });
});
