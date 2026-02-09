import { takeOne } from "@/util/array/takeOne";
import { describe, expect, test } from "vitest";

describe(takeOne, () => {
  test("returns first item", () => {
    expect.hasAssertions();
    expect(takeOne([""])).toBe("");
  });

  test("returns item with index", () => {
    expect.hasAssertions();
    expect(takeOne({ "": "" }, "")).toBe("");
  });
});
