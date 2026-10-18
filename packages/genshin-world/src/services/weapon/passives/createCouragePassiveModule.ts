import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { createAttackStackPassiveModule } from "#src/services/weapon/passives/createAttackStackPassiveModule";
import { takeOne } from "@esposter/shared";

const COURAGE_COOLDOWN_SECONDS = 0.5;

// Courage at its rank: each normal or charged attack hit raises its wielder's ATK by the rank's percentage per stack, up to
// Four stacks for six seconds, a stack at most once every half a second
export const createCouragePassiveModule = (params: number[]): WeaponPassiveModule =>
  createAttackStackPassiveModule({
    cooldownSeconds: COURAGE_COOLDOWN_SECONDS,
    id: "courage",
    perStackBonuses: [{ amount: takeOne(params, 0), attribute: Attribute.AttackPercent }],
  });
