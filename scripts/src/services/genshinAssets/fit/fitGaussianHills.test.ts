import { fitGaussianHills } from "#src/services/genshinAssets/fit/fitGaussianHills";
import { createGaussianHillsHeight } from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(fitGaussianHills, () => {
  test("fits a ground of one hill of a width it tries, which its own hills then draw back", () => {
    expect.hasAssertions();

    const getHeight = createGaussianHillsHeight({ base: 1, hills: [{ height: 4, width: 16, x: 8, z: 0 }] });
    const { errors, hills } = fitGaussianHills({
      bands: [64],
      center: [0, 0],
      falloff: 64,
      getHeight,
      radius: 64,
      step: 4,
      widths: [16],
    });
    const getFittedHeight = createGaussianHillsHeight(hills);

    expect(errors[0]?.rms).toBeLessThan(0.1);
    expect(Math.abs(getFittedHeight(8, 0) - 5)).toBeLessThan(0.2);
  });
});
