import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";
import type { HeldOutEqualiser } from "#src/models/genshinParity/music/HeldOutEqualiser";

import { computeBandGaps } from "#src/services/genshinParity/music/computeBandGaps";
import { fitBandGain } from "#src/services/genshinParity/music/fitBandGain";

const computeMeanDistance = (gaps: number[]): number =>
  gaps.reduce((sum, gap) => sum + Math.abs(gap), 0) / Math.max(gaps.length, 1);
const sliceBandLevels = ({ floor, game, ours }: BandLevels, start: number, end?: number): BandLevels => ({
  floor,
  game: game.slice(start, end),
  ours: ours.slice(start, end),
});
// A fixed equaliser fitted to a render's bands (`fitBandGain`, each band's gain exact in the score's measure) and
// Scored held out across time: each band's gain fitted on the first half of the frames is scored on the second and the
// Second's on the first, since a gain that only fits the frames it was fitted on is no balance of the music's. The
// Distances are the mean over the bands, as the score's is
export const fitHeldOutEqualiser = (bandLevelsList: BandLevels[]): HeldOutEqualiser => {
  const bandCount = Math.max(bandLevelsList.length, 1);
  let distance = 0;
  let equalisedDistance = 0;
  let heldOutDistance = 0;
  const gains: number[] = [];
  for (const levels of bandLevelsList) {
    const middle = Math.floor(levels.ours.length / 2);
    const first = sliceBandLevels(levels, 0, middle);
    const second = sliceBandLevels(levels, middle);
    const { distance: bandDistance, gain } = fitBandGain(levels);
    distance += computeMeanDistance(computeBandGaps(levels, 0));
    equalisedDistance += bandDistance;
    heldOutDistance += computeMeanDistance([
      ...computeBandGaps(second, fitBandGain(first).gain),
      ...computeBandGaps(first, fitBandGain(second).gain),
    ]);
    gains.push(gain);
  }
  return {
    distance: distance / bandCount,
    equalisedDistance: equalisedDistance / bandCount,
    gains,
    heldOutDistance: heldOutDistance / bandCount,
  };
};
