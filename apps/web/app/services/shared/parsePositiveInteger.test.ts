import { parsePositiveInteger } from "#src/services/shared/parsePositiveInteger";
import { describe, expect, test } from "vitest";

describe(parsePositiveInteger, () => {
  test("reads a whole number above zero", () => {
    expect.hasAssertions();

    expect(parsePositiveInteger("3")).toBe(3);
  });

  test.each(["", "0", "-1", "1.5", "three", undefined])("refuses %s", (text) => {
    expect.hasAssertions();

    expect(parsePositiveInteger(text)).toBeUndefined();
  });
});
