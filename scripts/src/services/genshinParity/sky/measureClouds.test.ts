import { measureClouds } from "#src/services/genshinParity/sky/measureClouds";
import { describe, expect, test } from "vitest";

const toClouds = (luminance: Float32Array): Uint8Array => Uint8Array.from(luminance, (value) => Number(value > 1.5));

describe(measureClouds, () => {
  const size = 20;
  const sky = new Uint8Array(size * size).fill(1);
  // A cloud over the left half of the sky, its edge a step or a ramp four pixels wide
  const drawCloud = (rampWidth: number): Float32Array =>
    Float32Array.from({ length: size * size }, (_value, pixel) => {
      const column = pixel % size;
      return Math.min(Math.max((size / 2 + rampWidth / 2 - column) / Math.max(rampWidth, 1), 0), 1) + 1;
    });

  test("reads a cut-out's edge sharper than a soft one's, over the same cover", () => {
    expect.hasAssertions();

    const [hard, soft] = [drawCloud(0), drawCloud(4)];
    const [hardStatistics, softStatistics] = [
      measureClouds(hard, { clouds: toClouds(hard), sky }, size, size),
      measureClouds(soft, { clouds: toClouds(soft), sky }, size, size),
    ];

    expect(hardStatistics.coverage).toBe(0.5);
    expect(hardStatistics.edgeSharpness).toBeGreaterThan(softStatistics.edgeSharpness);
  });
});
