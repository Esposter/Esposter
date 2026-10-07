import { fitSpectralNoiseChannel } from "#src/services/genshinAssets/fit/fitSpectralNoiseChannel";
import {
  createSeededRandom,
  getSpectralBin,
  SPECTRAL_ANGULAR_BIN_COUNT,
  SPECTRAL_RADIAL_BIN_COUNT,
  synthesizeSpectralNoise,
} from "genshin-engine";
import { describe, expect, test } from "vitest";

describe(fitSpectralNoiseChannel, () => {
  const size = 256;

  test("reads back the spectrum and quantiles a texture was synthesized from", () => {
    expect.hasAssertions();

    // A bin far enough out to hold many frequencies, so their drawn power averages near its own
    const bin = getSpectralBin(size / 4, 0, size, size) ?? 0;
    const amplitudes = Array.from(
      { length: SPECTRAL_RADIAL_BIN_COUNT * SPECTRAL_ANGULAR_BIN_COUNT },
      (_amplitude, index) => Number(index === bin),
    );
    const [field = new Float32Array()] = synthesizeSpectralNoise(
      { channels: [{ amplitudes, mean: 0 }], height: size, width: size },
      createSeededRandom(0),
    );
    const fitted = fitSpectralNoiseChannel(Float64Array.from(field), size, size, { count: 2, rowBandCount: 1 });

    // Every other bin holds only the transforms' rounding
    expect(fitted.amplitudes.findIndex((amplitude) => amplitude > 1e-6)).toBe(bin);
    expect(fitted.amplitudes.findLastIndex((amplitude) => amplitude > 1e-6)).toBe(bin);
    expect(fitted.amplitudes[bin]).toBeCloseTo(1, 1);
    expect(fitted.quantiles).toStrictEqual([
      [Math.min(...field), Math.max(...field)].map((value) => Number(value.toFixed(3))),
    ]);
  });
});
