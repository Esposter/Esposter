import type { PaimonsBargainsRotation } from "#src/models/shop/PaimonsBargainsRotation";

import { PAIMON_BARGAINS_PAIR_COUNT, PAIMON_BARGAINS_PAIR_OFFSET } from "#src/services/shop/constants";
import { computeGameDay } from "#src/services/time/computeGameDay";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The two characters and the five weapons Paimon's Bargains offers in the game-time month `now` falls in, the month counted
// From the game's daily hour. The pairs come round every six months, January being the fourth pair, and the weapon set is
// Blackcliff in the odd months and Royal in the even ones
export const getPaimonsBargainsOffer = (
  rotation: PaimonsBargainsRotation,
  now: Temporal.Instant,
): { characterIds: number[]; weaponIds: number[] } => {
  const month = computeGameDay(now).month;
  const characterIds = rotation.characterPairs.at((month + PAIMON_BARGAINS_PAIR_OFFSET) % PAIMON_BARGAINS_PAIR_COUNT);
  if (!characterIds)
    throw new InvalidOperationError(Operation.Read, "Paimon's Bargains rotation", `has no pair for month ${month}`);
  return { characterIds, weaponIds: month % 2 === 1 ? rotation.blackcliffWeaponIds : rotation.royalWeaponIds };
};
