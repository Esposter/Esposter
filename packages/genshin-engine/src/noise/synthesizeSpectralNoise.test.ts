import { SPECTRAL_ANGULAR_BIN_COUNT, SPECTRAL_RADIAL_BIN_COUNT } from "#src/noise/constants";
import { getSpectralBin } from "#src/noise/getSpectralBin";
import { synthesizeSpectralNoise } from "#src/noise/synthesizeSpectralNoise";
import { transformFourierGrid } from "#src/noise/transformFourierGrid";
import { createSeededRandom } from "#src/random/createSeededRandom";
import { describe, expect, test } from "vitest";

describe(synthesizeSpectralNoise, () => {
  const size = 8;
  const binCount = SPECTRAL_RADIAL_BIN_COUNT * SPECTRAL_ANGULAR_BIN_COUNT;
  const drawnBin = getSpectralBin(1, 0, size, size) ?? 0;
  const amplitudes = Array.from({ length: binCount }, (_amplitude, bin) => Number(bin === drawnBin));

  test("draws its power only in the bins its amplitudes name", () => {
    expect.hasAssertions();

    const [field = new Float32Array()] = synthesizeSpectralNoise(
      { channels: [{ amplitudes, mean: 0 }], height: size, width: size },
      createSeededRandom(0),
    );
    const [real, imaginary] = [Float64Array.from(field), new Float64Array(field.length)];
    transformFourierGrid(real, imaginary, size, size);
    const binPowers = new Float64Array(binCount);
    for (let row = 0; row < size; row++)
      for (let column = 0; column < size; column++) {
        const bin = getSpectralBin(column, row, size, size);
        const index = row * size + column;
        if (bin !== undefined)
          binPowers[bin] = (binPowers[bin] ?? 0) + (real[index] ?? 0) ** 2 + (imaginary[index] ?? 0) ** 2;
      }

    expect(binPowers.findIndex((power) => power > 1e-9)).toBe(drawnBin);
    expect(binPowers.findLastIndex((power) => power > 1e-9)).toBe(drawnBin);
  });

  test("hands each band of rows its quantiles by rank", () => {
    expect.hasAssertions();

    const [field = new Float32Array()] = synthesizeSpectralNoise(
      {
        channels: [
          {
            amplitudes,
            mean: 0,
            quantiles: [
              [0, 1],
              [2, 3],
            ],
          },
        ],
        height: size,
        width: size,
      },
      createSeededRandom(0),
    );
    const [top, bottom] = [field.slice(0, field.length / 2), field.slice(field.length / 2)];

    expect([Math.min(...top), Math.max(...top), Math.min(...bottom), Math.max(...bottom)]).toStrictEqual([0, 1, 2, 3]);
  });
});
