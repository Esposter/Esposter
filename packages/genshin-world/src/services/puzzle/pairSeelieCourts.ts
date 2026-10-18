import type { Seelie } from "#src/models/puzzle/Seelie";
import type { GroundPoint } from "genshin-engine";

import { SeelieState } from "#src/models/puzzle/SeelieState";

// Each court led by one Seelie, the closest pairs first and no court or Seelie taken twice. The candidate pairs are taken
// In order of their distance, so a Seelie with no court left, or a court with no Seelie left, is left unpaired
export const pairSeelieCourts = (seelies: readonly GroundPoint[], courts: readonly GroundPoint[]): Seelie[] => {
  const candidates = courts
    .flatMap((court, courtIndex) =>
      seelies.map((seelie, seelieIndex) => ({
        court,
        courtIndex,
        distance: Math.hypot(seelie.x - court.x, seelie.z - court.z),
        seelie,
        seelieIndex,
      })),
    )
    .toSorted((first, second) => first.distance - second.distance);
  const takenCourtIndexes = new Set<number>();
  const takenSeelieIndexes = new Set<number>();
  const pairs: Seelie[] = [];
  for (const { court, courtIndex, seelie, seelieIndex } of candidates) {
    if (takenCourtIndexes.has(courtIndex) || takenSeelieIndexes.has(seelieIndex)) continue;
    takenCourtIndexes.add(courtIndex);
    takenSeelieIndexes.add(seelieIndex);
    pairs.push({ court, progress: 0, start: seelie, state: SeelieState.Resting, unfollowedSeconds: 0 });
  }
  return pairs;
};
