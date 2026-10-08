import type { RarityRequiredExpsMap } from "#src/models/weapon/RarityRequiredExpsMap";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The EXP a weapon of one rarity needs to rise past each level, its index the level less one
export const getRarityRequiredExps = (
  rarityRequiredExpsMap: RarityRequiredExpsMap,
  rarity: number,
): readonly number[] => {
  const requiredExps = rarityRequiredExpsMap[String(rarity)];
  if (!requiredExps) throw new InvalidOperationError(Operation.Read, getRarityRequiredExps.name, `rarity ${rarity}`);
  return requiredExps;
};
