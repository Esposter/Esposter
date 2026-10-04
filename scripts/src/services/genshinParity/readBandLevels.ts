import type { BandLevels } from "#src/models/genshinParity/BandLevels";

import { readBandEnergies } from "#src/services/genshinParity/readBandEnergies";
import { readBandFloor } from "#src/services/genshinParity/readBandFloor";

const toDecibels = (energy: number): number => 10 * Math.log10(energy);
// Each octave band's levels in our render and the game's sound over `frames`, the frames a score reads
export const readBandLevels = (
  ours: Float32Array,
  game: Float32Array,
  sampleRate: number,
  frames: number[],
): BandLevels[] => {
  const ourBands = readBandEnergies(ours, sampleRate);
  return readBandEnergies(game, sampleRate).map((gameEnergies, band) => {
    const floor = toDecibels(readBandFloor(gameEnergies));
    return {
      floor,
      game: frames.map((frame) => Math.max(toDecibels(gameEnergies[frame] ?? 0), floor)),
      ours: frames.map((frame) => toDecibels(ourBands[band]?.[frame] ?? 0)),
    };
  });
};
