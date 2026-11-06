import { Operation } from "#src/models/shared/Operation";
import { checkIsEnumValue } from "#src/util/validation/checkIsEnumValue";
import { describe, expect, test } from "vitest";

describe(checkIsEnumValue, () => {
  test("accepts a value the enum has, and no other", () => {
    expect.hasAssertions();

    expect(checkIsEnumValue(Operation, Operation.Read)).toBe(true);
    expect(checkIsEnumValue(Operation, "")).toBe(false);
  });
});
