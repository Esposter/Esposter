import { computeWhiteBalance } from "#src/post/computeWhiteBalance";
import { Matrix3, Vector3 } from "three";
import { describe, expect, test } from "vitest";

describe(computeWhiteBalance, () => {
  test("keeps every colour as it is at no balance", () => {
    expect.hasAssertions();

    const identity = new Matrix3().elements;

    for (const [index, element] of computeWhiteBalance({ temperature: 0, tint: 0 }).elements.entries())
      expect(element).toBeCloseTo(identity[index] ?? 0, 3);
  });

  test("takes a saturated blue's red under none once the white is cooled", () => {
    expect.hasAssertions();

    const blue = new Vector3(0, 0, 1).applyMatrix3(computeWhiteBalance({ temperature: -10, tint: 0 }));

    expect(blue.x).toBeLessThan(0);
  });
});
