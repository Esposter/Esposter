import { MIN_CLARITY, OCTAVE_TOLERANCE } from "#src/services/voiceMatch/constants";

// The period of one frame in samples, or 0 for a frame with no clear one. Normalised cross-correlation over a
// Window that every lag sees whole, so the peaks are comparable across lags; the first peak within tolerance of the
// Best is taken, because the best is as often the sub-octave — twice the true period correlates almost as well
export const getPitchLag = (frame: Float32Array, minLag: number, maxLag: number): number => {
  const window = frame.length - maxLag;
  if (window <= 0) return 0;

  let mean = 0;
  for (const sample of frame) mean += sample;
  mean /= frame.length;
  const centered = frame.map((sample) => sample - mean);
  let leadPower = 0;
  for (let index = 0; index < window; index += 1) leadPower += (centered[index] ?? 0) ** 2;
  const correlations: number[] = [];
  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let product = 0;
    let lagPower = 0;
    for (let index = 0; index < window; index += 1) {
      const lagged = centered[index + lag] ?? 0;
      product += (centered[index] ?? 0) * lagged;
      lagPower += lagged * lagged;
    }

    correlations.push(product / Math.sqrt(leadPower * lagPower || 1));
  }

  const best = Math.max(...correlations);
  if (best < MIN_CLARITY) return 0;

  const firstPeak = correlations.findIndex(
    (correlation, index) =>
      correlation >= best * OCTAVE_TOLERANCE &&
      correlation >= (correlations[index - 1] ?? -Infinity) &&
      correlation >= (correlations[index + 1] ?? -Infinity),
  );
  return minLag + firstPeak;
};
