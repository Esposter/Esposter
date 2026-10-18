import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

import { checkIsReputationWeeklyLimitReached } from "#src/services/reputation/checkIsReputationWeeklyLimitReached";
import { REPUTATION_OFFER_FIRST_LEVEL } from "#src/services/reputation/constants";

// The request a nation's keeper offers at a level, drawn by weight from the requests of the group that level names,
// Narrowed to those `offerableQuestIds` name, the ones the player may take, with `roll` a number from zero up to one.
// Undefined below the level requests unlock at, where that level names no group with requests in it, and while the
// Week's request claims, `claimedAts`, have reached the limit, the keeper offering none until the reset
export const offerReputationRequest = (
  city: ReputationCity,
  level: number,
  roll: number,
  offerableQuestIds: readonly string[],
  claimedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): ReputationRequest | undefined => {
  if (level < REPUTATION_OFFER_FIRST_LEVEL) return undefined;
  if (checkIsReputationWeeklyLimitReached(claimedAts, now)) return undefined;
  const requestGroupId = city.levels.find((reputationLevel) => reputationLevel.level === level)?.requestGroupId;
  const requests = city.requests.filter(
    ({ groupId, questId }) => groupId === requestGroupId && offerableQuestIds.includes(String(questId)),
  );
  const weightEnds: number[] = [];
  let totalWeight = 0;
  for (const { weight } of requests) weightEnds.push((totalWeight += weight));
  const index = weightEnds.findIndex((weightEnd) => roll * totalWeight < weightEnd);
  return index === -1 ? undefined : requests[index];
};
