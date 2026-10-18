import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

import { REPUTATION_OFFER_FIRST_LEVEL } from "#src/services/reputation/constants";

// The request a nation's keeper offers at a level, drawn by weight from the requests of the group the level's row names,
// With `roll` a number from zero up to one. Undefined below the level requests unlock at, and where that level names no
// Group with requests in it
export const offerReputationRequest = (
  city: ReputationCity,
  level: number,
  roll: number,
): ReputationRequest | undefined => {
  if (level < REPUTATION_OFFER_FIRST_LEVEL) return undefined;
  const requestGroupId = city.levels.find((reputationLevel) => reputationLevel.level === level)?.requestGroupId;
  const requests = city.requests.filter(({ groupId }) => groupId === requestGroupId);
  const weightEnds: number[] = [];
  let totalWeight = 0;
  for (const { weight } of requests) weightEnds.push((totalWeight += weight));
  const index = weightEnds.findIndex((weightEnd) => roll * totalWeight < weightEnd);
  return index === -1 ? undefined : requests[index];
};
