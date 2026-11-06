import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { checkIsEnumValue } from "#src/services/shared/checkIsEnumValue";
import { describe, expect, test } from "vitest";

describe(checkIsEnumValue, () => {
  test("accepts a value the enum has, and no other", () => {
    expect.hasAssertions();

    expect(checkIsEnumValue(ComputeKind, ComputeKind.Screen)).toBe(true);
    expect(checkIsEnumValue(ComputeKind, "Units")).toBe(false);
  });
});
