import type { SpectralNoiseProfile } from "#src/models/noise/SpectralNoiseProfile";

import { getSpectralBin } from "#src/noise/getSpectralBin";
import { transformFourierGrid } from "#src/noise/transformFourierGrid";

// How many of a band's values, sorted, stand under the value given, by halving
const countUnder = (sorted: Float32Array, value: number): number => {
  let [low, high] = [0, sorted.length];
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((sorted[middle] ?? 0) < value) low = middle + 1;
    else high = middle;
  }
  return low;
};
// A share of the values a band holds read off its quantiles, linearly between the two either side
const readQuantile = (quantiles: readonly number[], share: number): number => {
  const position = share * (quantiles.length - 1);
  const lower = Math.floor(position);
  const [low = 0, high = low] = [quantiles[lower], quantiles[lower + 1]];
  return low + (high - low) * (position - lower);
};
// A texture synthesized from its statistics (`SpectralNoiseProfile`), a field a channel, row after row: at every
// Frequency a complex Gaussian drawn from the random stream given, part of an earlier channel's where the channel
// Follows one, scaled by its bin's amplitude and turned back by the inverse transform (`transformFourierGrid`), which
// Tiles at every edge; then, where the channel keeps its values' quantiles, each band of rows handed them by rank
export const synthesizeSpectralNoise = (
  { channels, height, width }: SpectralNoiseProfile,
  random: () => number,
): Float32Array[] => {
  const count = width * height;
  // Each frequency's bin, the same for every channel
  const bins = Array.from({ length: count }, (_bin, index) =>
    getSpectralBin(index % width, Math.floor(index / width), width, height),
  );
  const draws: { imaginary: Float64Array; real: Float64Array }[] = [];
  return channels.map(({ amplitudes, correlation, mean, quantiles }) => {
    const draw = { imaginary: new Float64Array(count), real: new Float64Array(count) };
    for (let index = 0; index < count; index++) {
      // Box–Muller, each part's variance a half so the draw's is one
      const radius = Math.sqrt(-Math.log(Math.max(random(), Number.MIN_VALUE)));
      const angle = 2 * Math.PI * random();
      draw.real[index] = radius * Math.cos(angle);
      draw.imaginary[index] = radius * Math.sin(angle);
    }
    const followed = correlation ? draws[correlation.channel] : undefined;
    if (correlation && followed) {
      const own = Math.sqrt(1 - correlation.share ** 2);
      for (let index = 0; index < count; index++) {
        draw.real[index] = correlation.share * (followed.real[index] ?? 0) + own * (draw.real[index] ?? 0);
        draw.imaginary[index] =
          correlation.share * (followed.imaginary[index] ?? 0) + own * (draw.imaginary[index] ?? 0);
      }
    }
    draws.push(draw);
    // The inverse transform as the forward one over the conjugate, whose real part is the field's
    const [real, imaginary] = [new Float64Array(count), new Float64Array(count)];
    for (const [index, bin] of bins.entries()) {
      const amplitude = (bin === undefined ? 0 : (amplitudes[bin] ?? 0)) * Math.sqrt(count);
      real[index] = (draw.real[index] ?? 0) * amplitude;
      imaginary[index] = -(draw.imaginary[index] ?? 0) * amplitude;
    }
    transformFourierGrid(real, imaginary, width, height);
    // The real part of a field of random phases holds half its variance
    const field = Float32Array.from(real, (value) => mean + (value / count) * Math.SQRT2);
    if (!quantiles) return field;
    const bandRows = height / quantiles.length;
    for (const [band, bandQuantiles] of quantiles.entries()) {
      const bandField = field.subarray(band * bandRows * width, (band + 1) * bandRows * width);
      const sorted = bandField.toSorted();
      const last = Math.max(sorted.length - 1, 1);
      // Values that tie take the ranks they span in turn, so the band still reaches both its ends
      const tieOffsetMap = new Map<number, number>();
      for (const [index, value] of bandField.entries()) {
        const under = countUnder(sorted, value);
        const isTied = sorted[under + 1] === value;
        const offset = isTied ? (tieOffsetMap.get(value) ?? 0) : 0;
        if (isTied) tieOffsetMap.set(value, offset + 1);
        bandField[index] = readQuantile(bandQuantiles, (under + offset) / last);
      }
    }
    return field;
  });
};
