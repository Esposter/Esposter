import { computeWindGust } from "#src/services/mondstadt/computeWindGust";
import { createMondstadtWindUniforms } from "#src/services/mondstadt/createMondstadtWindUniforms";
import { describe, expect, test } from "vitest";

describe(createMondstadtWindUniforms, () => {
  test("gusts roll across the meadows", () => {
    expect.hasAssertions();

    const { gustSpeed, gustStrength, gustWidth } = createMondstadtWindUniforms();
    const wind = { gustSpeed: gustSpeed.value, gustStrength: gustStrength.value, gustWidth: gustWidth.value };
    const period = wind.gustWidth / wind.gustSpeed;
    const samples = Array.from({ length: 20 }, (_, index) => (index * period) / 20);
    const gusts = samples.map((seconds) => computeWindGust(0, seconds, wind));
    const halfWidthGusts = samples.map((seconds) => computeWindGust(wind.gustWidth / 2, seconds, wind));

    // A gust band travels downwind, so the gust at a point further on is the gust here, a little later
    const distance = 10;
    expect(computeWindGust(distance, 3 + distance / wind.gustSpeed, wind)).toBeCloseTo(computeWindGust(0, 3, wind));
    // The gust swells and falls as a band passes a point
    expect(Math.max(...gusts)).toBeGreaterThan(Math.min(...gusts));
    // Neighbouring points are out of step, so the grass does not move as one
    expect(gusts.some((gust, index) => gust !== halfWidthGusts[index])).toBe(true);
  });
});
