import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createAttackStackPassiveModule } from "#src/services/weapon/passives/createAttackStackPassiveModule";
import { takeOne } from "@esposter/shared";

const INFUSION_BLADE_COOLDOWN_SECONDS = 0.5;

// Infusion Blade at its rank: each normal or charged attack hit raises ATK and DEF by the rank's percentage per stack
export const createInfusionBladePassiveModule = (params: number[]): WeaponPassiveModule => {
  const percentage = takeOne(params, 0);
  return createAttackStackPassiveModule({
    cooldownSeconds: INFUSION_BLADE_COOLDOWN_SECONDS,
    id: "infusionBlade",
    perStackBonuses: [
      { amount: percentage, attribute: Attribute.AttackPercent },
      { amount: percentage, attribute: Attribute.DefensePercent },
    ],
  });
};
