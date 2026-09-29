import { computeOriginShift } from "#src/world/computeOriginShift";
import { Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeOriginShift, () => {
  test("shifts by the camera's ground position, rounded to a step, only past the threshold", () => {
    expect.hasAssertions();

    const shift = new Vector3();
    const isNearShifted = computeOriginShift(new Vector3(1, 5, 0), 2, 4, shift);
    const isFarShifted = computeOriginShift(new Vector3(5, 5, -3), 2, 4, shift);

    expect({ isFarShifted, isNearShifted, shift }).toStrictEqual({
      isFarShifted: true,
      isNearShifted: false,
      shift: new Vector3(4, 0, -4),
    });
  });
});
