import { computeTextureMean } from "#src/services/genshinAssets/fit/computeTextureMean";
import { fitSpectrumAmplitudes } from "#src/services/genshinAssets/fit/fitSpectrumAmplitudes";
import { transformFourierGrid } from "genshin-engine";

const LEAST_SLOPE = 1e-6;

// The height a normal map is the slope of, as its spectrum: each frequency's power across both slopes over what the
// Central differences a synthesis takes them by pass at that frequency
export const fitSlopeHeight = (across: Float64Array, down: Float64Array, width: number, height: number): number[] => {
  const transform = (values: Float64Array): { imaginary: Float64Array; real: Float64Array } => {
    const mean = computeTextureMean(values);
    const real = values.map((value) => value - mean);
    const imaginary = new Float64Array(values.length);
    transformFourierGrid(real, imaginary, width, height);
    return { imaginary, real };
  };
  const [acrossSpectrum, downSpectrum] = [transform(across), transform(down)];
  const power = new Float64Array(width * height);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const index = row * width + column;
      const passed = Math.sin((2 * Math.PI * column) / width) ** 2 + Math.sin((2 * Math.PI * row) / height) ** 2;
      if (passed < LEAST_SLOPE) continue;
      power[index] =
        ((acrossSpectrum.real[index] ?? 0) ** 2 +
          (acrossSpectrum.imaginary[index] ?? 0) ** 2 +
          (downSpectrum.real[index] ?? 0) ** 2 +
          (downSpectrum.imaginary[index] ?? 0) ** 2) /
        passed;
    }
  return fitSpectrumAmplitudes(power, width, height);
};
