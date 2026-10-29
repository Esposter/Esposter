import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";
import type { Spectrogram } from "#src/models/recreation/signal/Spectrogram";

import { computeBandEnergies } from "#src/services/genshinParity/music/computeBandEnergies";
import { computeBandFloor } from "#src/services/genshinParity/music/computeBandFloor";
import { MUSIC_ENERGY_FLOOR } from "#src/services/genshinParity/music/constants";
import { toDecibels } from "#src/services/genshinParity/shared/toDecibels";

// Each octave band's levels in our render and the game's sound over `frames`, the frames a score reads
export const computeBandLevels = (ours: Spectrogram, game: Spectrogram, frames: number[]): BandLevels[] => {
  const ourBands = computeBandEnergies(ours);
  return computeBandEnergies(game).map((gameEnergies, band) => {
    const floor = toDecibels(computeBandFloor(gameEnergies), MUSIC_ENERGY_FLOOR);
    return {
      floor,
      game: frames.map((frame) => Math.max(toDecibels(gameEnergies[frame] ?? 0, MUSIC_ENERGY_FLOOR), floor)),
      ours: frames.map((frame) => toDecibels(ourBands[band]?.[frame] ?? 0, MUSIC_ENERGY_FLOOR)),
    };
  });
};
