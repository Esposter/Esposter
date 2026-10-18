import { computeWindGust } from "#src/services/mondstadt/computeWindGust";
import { computeWindmillSailAngle } from "#src/services/mondstadt/computeWindmillSailAngle";
import { describe, expect, test } from "vitest";

describe(computeWindmillSailAngle, () => {
  test("a windmill's sails turn in a gust", () => {
    expect.hasAssertions();

    // Made-up wind: a steady breeze of 1 with a gust of 2 that reaches the windmill at downwind 1 at time 0 and misses it at downwind 3
    const wind = { gustSpeed: 1, gustStrength: 2, gustWidth: 4, strength: 1 };
    const radiansPerSecondPerWind = 0.5;
    const calm = computeWindmillSailAngle(0, 1, wind.strength + computeWindGust(3, 0, wind), radiansPerSecondPerWind);
    const gusted = computeWindmillSailAngle(0, 1, wind.strength + computeWindGust(1, 0, wind), radiansPerSecondPerWind);

    expect(calm).toBeGreaterThan(0);
    expect(gusted).toBeGreaterThan(calm);
  });
});
