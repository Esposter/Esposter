import type { SpectralNoiseChannel } from "genshin-engine";

import { fitSpectrumAmplitudes } from "#src/services/genshinAssets/fit/fitSpectrumAmplitudes";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { transformFourierGrid } from "genshin-engine";

// The decimals a quantile keeps, under a byte's step
const QUANTILE_DECIMALS = 3;
// One channel of a texture, row after row, as the statistics it is synthesized from (`SpectralNoiseChannel`): its mean,
// Its spectrum's amplitude bin by bin, and given a count of them, its values' quantiles at that many evenly spaced
// Shares in each of that many bands of rows from the first down
export const fitSpectralNoiseChannel = (
  values: Float64Array,
  width: number,
  height: number,
  quantiles?: { count: number; rowBandCount: number },
): SpectralNoiseChannel => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const [real, imaginary] = [values.map((value) => value - mean), new Float64Array(values.length)];
  transformFourierGrid(real, imaginary, width, height);
  const power = real.map((value, index) => value ** 2 + (imaginary[index] ?? 0) ** 2);
  const channel: SpectralNoiseChannel = {
    amplitudes: fitSpectrumAmplitudes(power, width, height),
    mean: roundFitted(mean, QUANTILE_DECIMALS),
  };
  if (!quantiles) return channel;
  const bandRows = height / quantiles.rowBandCount;
  channel.quantiles = Array.from({ length: quantiles.rowBandCount }, (_band, band) => {
    const sorted = values.slice(band * bandRows * width, (band + 1) * bandRows * width).toSorted();
    return Array.from({ length: quantiles.count }, (_quantile, index) =>
      roundFitted(sorted[Math.round((index / (quantiles.count - 1)) * (sorted.length - 1))] ?? 0, QUANTILE_DECIMALS),
    );
  });
  return channel;
};
