import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createAttackStackPassiveModule } from "#src/services/weapon/passives/createAttackStackPassiveModule";
import { takeOne } from "@esposter/shared";

// Infusion Arrow at its rank: each normal or charged attack hit raises ATK and Normal ATK SPD by the rank's numbers per
// Stack, once the rank's cooldown has run out since the last
export const createInfusionArrowPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercentage = takeOne(params, 0);
  const normalAttackSpeed = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return createAttackStackPassiveModule({
    cooldownSeconds,
    id: "infusionArrow",
    perStackBonuses: [
      { amount: attackPercentage, attribute: Attribute.AttackPercent },
      { amount: normalAttackSpeed, attribute: Attribute.NormalAttackSpeed },
    ],
  });
};
