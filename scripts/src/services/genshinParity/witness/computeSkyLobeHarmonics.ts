import { STONE_HARMONIC_COUNT } from "genshin-engine";

// The light a face turned by c, its normal's cosine to a direction, takes from a light there: a directional light's
// Irradiance projected onto the harmonics' two bands (Ramamoorthi and Hanrahan, ¼ + c/2 + 15c²/32 − 5/32), its
// Constant raised from 3/32 to the least that never goes below none, 1 / (16 · 15/32), so a sky made of these lights
// Lights no face below none whichever way it turns
const SKY_LOBE_CONSTANT = 2 / 15;
const SKY_LOBE_LINEAR = 1 / 2;
const SKY_LOBE_SQUARE = 15 / 32;
// The harmonics' terms (`computeStoneHarmonics`) whose sum is that light, from a light toward a unit direction: the
// Cosine's square spread over the terms on the unit sphere, where x² and z² are (1 − y² ± (x² − z²)) / 2 and y² is
// (1 + (3y² − 1)) / 3
export const computeSkyLobeHarmonics = ([x = 0, y = 0, z = 0]: readonly number[]): number[] => {
  const across = (x * x + z * z) / 2;
  const upward = (y * y - across) / 3;
  const harmonics = Array.from({ length: STONE_HARMONIC_COUNT }, () => 0);
  harmonics[0] = SKY_LOBE_CONSTANT + SKY_LOBE_SQUARE * (across + upward);
  harmonics[1] = SKY_LOBE_LINEAR * x;
  harmonics[2] = SKY_LOBE_LINEAR * y;
  harmonics[3] = SKY_LOBE_LINEAR * z;
  harmonics[4] = SKY_LOBE_SQUARE * 2 * x * y;
  harmonics[5] = SKY_LOBE_SQUARE * 2 * y * z;
  harmonics[6] = SKY_LOBE_SQUARE * 2 * x * z;
  harmonics[7] = (SKY_LOBE_SQUARE * (x * x - z * z)) / 2;
  harmonics[8] = SKY_LOBE_SQUARE * upward;
  return harmonics;
};
