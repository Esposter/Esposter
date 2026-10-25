import { getPropertyValue } from "#shared/services/achievement/conditions/getPropertyValue";
import { describe, expect, test } from "vitest";

describe(getPropertyValue, () => {
  test("reads the value at a dotted path", () => {
    expect.hasAssertions();

    expect(getPropertyValue({ data: { pointCount: 3 } }, "data.pointCount")).toBe(3);
  });

  // A save with no data yet, or a null step, reads as absent rather than throwing, so a condition on it is unmet
  test("reads undefined through a step that is absent or null", () => {
    expect.hasAssertions();

    expect(
      getPropertyValue<{ data?: { pointCount: number } }, "data.pointCount">({}, "data.pointCount"),
    ).toBeUndefined();
    expect(
      getPropertyValue<{ data: null | { pointCount: number } }, "data.pointCount">({ data: null }, "data.pointCount"),
    ).toBeUndefined();
  });
});
