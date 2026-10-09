import type { TerrainResidual } from "#src/models/terrain/TerrainResidual";

import { createSimplexNoise } from "#src/noise/createSimplexNoise";
import { sampleTerrainResidualFade } from "#src/terrain/sampleTerrainResidualFade";

// The residual's height at any x and z: simplex noise summed over its octaves, each at twice the frequency and half the
// Amplitude of the one below, scaled by its fade's weight there. Where the fade draws none, no octave is summed
export const createResidualHeight = ({
  amplitude,
  fade,
  octaves,
  scale,
  seed,
}: TerrainResidual): ((x: number, z: number) => number) => {
  const noise = createSimplexNoise(seed);
  return (x, z) => {
    const weight = fade ? sampleTerrainResidualFade(fade, x, z) : 1;
    if (weight === 0) return 0;
    let total = 0;
    let octaveAmplitude = amplitude;
    let frequency = 1 / scale;
    for (let octave = 0; octave < octaves; octave++) {
      total += octaveAmplitude * noise(x * frequency, z * frequency);
      octaveAmplitude /= 2;
      frequency *= 2;
    }
    return weight * total;
  };
};
