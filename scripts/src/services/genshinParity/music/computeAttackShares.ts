import type { AttackShares } from "#src/models/genshinParity/music/AttackShares";
import type { BandLevels } from "#src/models/genshinParity/music/BandLevels";

import { LISTEN_ATTACK_RISE_DECIBELS } from "#src/services/genshinParity/shared/constants";

// How often each band's level jumps from one frame to the next, in the game's sound and in ours: the share of the
// Frames following another in `frames` whose level stands `LISTEN_ATTACK_RISE_DECIBELS` or more over it, each level
// Read no quieter than the band's floor. A band ours jumps in more often than the game's is one ours strikes notes in
// That the game holds or swells into, which a listener hears as separate sounds; one it jumps in less is missing the
// Game's attacks
export const computeAttackShares = (bandLevelsList: BandLevels[], frames: number[]): AttackShares[] => {
  const followers = [...frames.keys()].filter((index) => index > 0 && frames[index] === (frames[index - 1] ?? 0) + 1);
  return bandLevelsList.map(({ floor, game, ours }) => {
    const readShare = (levels: number[]): number =>
      followers.filter(
        (index) =>
          Math.max(levels[index] ?? floor, floor) - Math.max(levels[index - 1] ?? floor, floor) >=
          LISTEN_ATTACK_RISE_DECIBELS,
      ).length / Math.max(followers.length, 1);
    return { game: readShare(game), ours: readShare(ours) };
  });
};
