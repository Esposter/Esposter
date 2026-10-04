import type { Spectrogram } from "#src/models/genshinAssets/shared/Spectrogram";

import { computeMedian } from "#src/services/genshinAssets/shared/computeMedian";

// The median over frames of a band's spectral flatness, the geometric mean of its bins' power over their arithmetic
// Mean: near 0 where a few partials hold the band, near 0.56 for white noise under a Hann window, whose bins' power
// Spreads exponentially
export const computeMedianFlatness = (
  { binCount, magnitudes }: Spectrogram,
  frames: number[],
  [low, high]: [number, number],
): number =>
  computeMedian(
    frames.map((frame) => {
      let logSum = 0;
      let sum = 0;
      for (let bin = low; bin <= high; bin++) {
        const power = (magnitudes[frame * binCount + bin] ?? 0) ** 2 + Number.MIN_VALUE;
        logSum += Math.log(power);
        sum += power;
      }
      const count = high - low + 1;
      return Math.exp(logSum / count) / (sum / count);
    }),
  );
