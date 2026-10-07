import { getSpectralBin, SPECTRAL_ANGULAR_BIN_COUNT, SPECTRAL_RADIAL_BIN_COUNT } from "genshin-engine";

// The significant digits an amplitude keeps, a spectrum's bins standing apart by orders of magnitude
const AMPLITUDE_DIGITS = 3;
// A texture's spectrum by its bins (`getSpectralBin`): the root mean square amplitude over a texel of the power given
// At each frequency of its transform, row after row
export const fitSpectrumAmplitudes = (power: Float64Array, width: number, height: number): number[] => {
  const binCount = SPECTRAL_RADIAL_BIN_COUNT * SPECTRAL_ANGULAR_BIN_COUNT;
  const [sums, counts] = [new Float64Array(binCount), new Float64Array(binCount)];
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const bin = getSpectralBin(column, row, width, height);
      if (bin === undefined) continue;
      sums[bin] = (sums[bin] ?? 0) + (power[row * width + column] ?? 0);
      counts[bin] = (counts[bin] ?? 0) + 1;
    }
  return Array.from(sums, (sum, bin) =>
    Number(Math.sqrt(sum / Math.max(counts[bin] ?? 0, 1) / (width * height)).toPrecision(AMPLITUDE_DIGITS)),
  );
};
