import type { SpectralNoiseProfile } from "#src/models/noise/SpectralNoiseProfile";

import { SPECTRAL_ANGULAR_BIN_COUNT, SPECTRAL_RADIAL_BIN_COUNT } from "#src/noise/constants";
import { synthesizeSpectralNoise } from "#src/noise/synthesizeSpectralNoise";
import { createSeededRandom } from "#src/random/createSeededRandom";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

// A profile's cost follows the texels it draws, every channel one field of them, so each side doubles the texels a
// Fourfold, and a banded channel sorts each band's values into its quantiles' ranks
const SMALL_SIDE = 32;
const LARGE_SIDE = 128;
const BENCH_CHANNEL_COUNT = 4;
const BENCH_BAND_COUNT = 4;
const BENCH_QUANTILE_COUNT = 8;
const BENCH_SEED = 7;
const createProfile = (side: number): SpectralNoiseProfile => {
  const random = createSeededRandom(BENCH_SEED);
  return {
    channels: Array.from({ length: BENCH_CHANNEL_COUNT }, (_channel, index) => ({
      amplitudes: Array.from({ length: SPECTRAL_RADIAL_BIN_COUNT * SPECTRAL_ANGULAR_BIN_COUNT }, () => random()),
      correlation: index > 0 ? { channel: 0, share: 0.5 } : undefined,
      mean: 0,
      quantiles: Array.from({ length: BENCH_BAND_COUNT }, () =>
        Array.from({ length: BENCH_QUANTILE_COUNT }, (_value, rank) => rank / (BENCH_QUANTILE_COUNT - 1)),
      ),
    })),
    height: side,
    width: side,
  };
};
const smallProfile = createProfile(SMALL_SIDE);
const largeProfile = createProfile(LARGE_SIDE);

// One group, the two sides compared within it, each drawn from the same seed so the stream costs the same
describe(synthesizeSpectralNoise, () => {
  test("a texture of each side", async ({ bench }) => {
    await bench.compare(
      bench(`${SMALL_SIDE} texels a side`, () => {
        synthesizeSpectralNoise(smallProfile, createSeededRandom(BENCH_SEED));
      }),
      bench(`${LARGE_SIDE} texels a side`, () => {
        synthesizeSpectralNoise(largeProfile, createSeededRandom(BENCH_SEED));
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
