import type { TerrainResidual } from "#src/models/terrain/TerrainResidual";

import { createSimplexNoise } from "#src/noise/createSimplexNoise";

// The residual's height at any x and z: simplex noise summed over its octaves, each at twice the frequency and half the
// Amplitude of the one below
export const createResidualHeight = ({
  amplitude,
  octaves,
  scale,
  seed,
}: TerrainResidual): ((x: number, z: number) => number) => {
  const noise = createSimplexNoise(seed);
  return (x, z) => {
    let total = 0;
    let octaveAmplitude = amplitude;
    let frequency = 1 / scale;
    for (let octave = 0; octave < octaves; octave++) {
      total += octaveAmplitude * noise(x * frequency, z * frequency);
      octaveAmplitude /= 2;
      frequency *= 2;
    }
    return total;
  };
};
