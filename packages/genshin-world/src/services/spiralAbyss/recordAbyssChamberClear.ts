import type { AbyssChallenge } from "#src/models/spiralAbyss/AbyssChallenge";
import type { AbyssChamber } from "#src/models/spiralAbyss/AbyssChamber";
import type { AbyssClearResult } from "#src/models/spiralAbyss/AbyssClearResult";
import type { AbyssFloor } from "#src/models/spiralAbyss/AbyssFloor";
import type { AbyssFloorReward } from "#src/models/spiralAbyss/AbyssFloorReward";
import type { PartyMember } from "#src/models/party/PartyMember";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

import { computeAbyssChamberStars } from "#src/services/spiralAbyss/computeAbyssChamberStars";
import { computeAbyssFloorStars } from "#src/services/spiralAbyss/computeAbyssFloorStars";
import { takeAbyssCarry } from "#src/services/spiralAbyss/takeAbyssCarry";

// The progress after a cleared chamber: its stars kept as the most any clear has earned, and its rewards given once. A first
// Clear gives the chamber's own reward, and each star milestone the floor's stars reach gives its reward, each only the first
// Time in the cycle. The rewards this clear gives are returned, and a clear that gives none leaves the claimed ids as they were.
// The party's health and energy as they stand here are taken as the carry the next chamber starts from
export const recordAbyssChamberClear = (
  progress: AbyssProgress,
  floor: AbyssFloor,
  chamber: AbyssChamber,
  challenge: AbyssChallenge,
  reward: AbyssFloorReward,
  characterIdMemberMap: ReadonlyMap<number, PartyMember>,
): AbyssClearResult => {
  const previousProgress = progress.chamberIdProgressMap.get(chamber.id);
  const chamberIdProgressMap = new Map(progress.chamberIdProgressMap).set(chamber.id, {
    isCleared: true,
    stars: Math.max(previousProgress?.stars ?? 0, computeAbyssChamberStars(chamber, challenge)),
  });
  const floorStars = computeAbyssFloorStars(floor, { ...progress, chamberIdProgressMap });
  const milestones: readonly (readonly [number, number])[] = [
    [3, reward.threeStarRewardId],
    [6, reward.sixStarRewardId],
    [9, reward.nineStarRewardId],
  ];
  const firstClearRewardId = previousProgress?.isCleared ? undefined : reward.chamberRewardIds.at(chamber.index - 1);
  const candidateRewardIds = [
    ...(firstClearRewardId === undefined ? [] : [firstClearRewardId]),
    ...milestones.filter(([stars]) => floorStars >= stars).map(([, rewardId]) => rewardId),
  ];
  const givenRewardIds = candidateRewardIds.filter((rewardId) => !progress.claimedRewardIds.has(rewardId));
  return {
    carry: takeAbyssCarry([...characterIdMemberMap.keys()], characterIdMemberMap),
    givenRewardIds,
    progress: { chamberIdProgressMap, claimedRewardIds: new Set([...progress.claimedRewardIds, ...givenRewardIds]) },
  };
};
