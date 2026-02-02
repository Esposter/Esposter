import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
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

  test("throws if item is undefined", () => {
    expect.hasAssertions();
    expect(() => takeOne([])).toThrowError(
      new InvalidOperationError(Operation.Read, takeOne.name, `Values: ${[]}, index: 0 out of bounds`),
    );
  });
});
