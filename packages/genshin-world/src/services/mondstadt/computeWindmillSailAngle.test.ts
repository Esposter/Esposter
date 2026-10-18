import { computeWindmillSailAngle } from "#src/services/mondstadt/computeWindmillSailAngle";
import { describe, expect, test } from "vitest";

describe(computeWindmillSailAngle, () => {
  test("a windmill's sails turn in a gust", () => {
    expect.hasAssertions();

    // Made-up wind: a breeze of 1, and the same breeze with a gust of 2 on top of it at the windmill
    const breeze = 1;
    const gust = 2;
    const radiansPerSecondPerWind = 0.5;
    const calm = computeWindmillSailAngle(0, 1, breeze, radiansPerSecondPerWind);
    const gusted = computeWindmillSailAngle(0, 1, breeze + gust, radiansPerSecondPerWind);

    expect(calm).toBeGreaterThan(0);
    expect(gusted).toBeGreaterThan(calm);
  });
});
