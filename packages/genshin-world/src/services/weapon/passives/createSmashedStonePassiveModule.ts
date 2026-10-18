import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createAttackStackPassiveModule } from "#src/services/weapon/passives/createAttackStackPassiveModule";
import { takeOne } from "@esposter/shared";

const SMASHED_STONE_COOLDOWN_SECONDS = 0.3;

// Smashed Stone at its rank: each normal or charged attack hit raises ATK and DEF by the rank's percentage per stack
export const createSmashedStonePassiveModule = (params: number[]): WeaponPassiveModule => {
  const percentage = takeOne(params, 0);
  return createAttackStackPassiveModule({
    cooldownSeconds: SMASHED_STONE_COOLDOWN_SECONDS,
    id: "smashedStone",
    perStackBonuses: [
      { amount: percentage, attribute: Attribute.AttackPercent },
      { amount: percentage, attribute: Attribute.DefensePercent },
    ],
  });
};
