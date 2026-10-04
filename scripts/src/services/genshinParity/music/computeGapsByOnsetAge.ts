import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";
import type { OnsetAgeGaps } from "#src/models/genshinParity/music/OnsetAgeGaps";

import { computeMean } from "#src/services/genshinAssets/shared/computeMean";
import { computeBandGaps } from "#src/services/genshinParity/music/computeBandGaps";
import { DECAY_AGE_BOUNDS } from "#src/services/genshinParity/shared/constants";

// Each band's gap from the game's sound read by how long before each frame the last note began, in the spans
// `DECAY_AGE_BOUNDS` divides, the last open: a gap that falls with the age is a sound that dies sooner than the game's,
// The room's ring or a note's release, and one high at the youngest is an attack that speaks louder. `frameTimes` are
// The centres of the frames `bandLevelsList` holds in seconds, ascending, as `onsets` are once sorted
export const computeGapsByOnsetAge = (
  bandLevelsList: BandLevels[],
  frameTimes: number[],
  onsets: number[],
): OnsetAgeGaps[] => {
  const sortedOnsets = onsets.toSorted((firstOnset, secondOnset) => firstOnset - secondOnset);
  let next = 0;
  const spans = frameTimes.map((time) => {
    while ((sortedOnsets[next] ?? Infinity) <= time) next++;
    const age = time - (sortedOnsets[next - 1] ?? -Infinity);
    const span = DECAY_AGE_BOUNDS.findIndex((bound) => age < bound);
    return span === -1 ? DECAY_AGE_BOUNDS.length : span;
  });
  const bandGapsList = bandLevelsList.map((bandLevels) => computeBandGaps(bandLevels, 0));
  return Array.from({ length: DECAY_AGE_BOUNDS.length + 1 }, (_value, span) => {
    const members = [...spans.keys()].filter((frame) => spans[frame] === span);
    return {
      bandGaps: bandGapsList.map((gaps) => computeMean(members.map((frame) => gaps[frame] ?? 0))),
      share: members.length / Math.max(frameTimes.length, 1),
    };
  });
};
