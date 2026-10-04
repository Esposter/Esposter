import type { BandLevels } from "#src/models/genshinParity/BandLevels";
import type { MusicEqualizer } from "#src/models/genshinParity/MusicEqualizer";

import { readMean } from "#src/services/genshinAssets/readMean";
import { fitBandGain } from "#src/services/genshinParity/fitBandGain";
import { readBandGaps } from "#src/services/genshinParity/readBandGaps";

const readHalf = ({ floor, game, ours }: BandLevels, start: number, end?: number): BandLevels => ({
  floor,
  game: game.slice(start, end),
  ours: ours.slice(start, end),
});
// A bus equaliser of one gain an octave band, each fitted exactly to the game's sound (`fitBandGain`), and the same
// Fitted to each half of the frames in time and scored on the other
export const fitMusicEqualizer = (bandLevelsList: BandLevels[]): MusicEqualizer => {
  const fits = bandLevelsList.map((bandLevels) => fitBandGain(bandLevels));
  const heldOutDistances = bandLevelsList.map((bandLevels) => {
    const middle = Math.floor(bandLevels.ours.length / 2);
    const first = readHalf(bandLevels, 0, middle);
    const second = readHalf(bandLevels, middle);
    const gaps = [...readBandGaps(first, fitBandGain(second).gain), ...readBandGaps(second, fitBandGain(first).gain)];
    return readMean(gaps.map((gap) => Math.abs(gap)));
  });
  return {
    distance: readMean(fits.map(({ distance }) => distance)),
    gains: fits.map(({ gain }) => gain),
    heldOutDistance: readMean(heldOutDistances),
  };
};
