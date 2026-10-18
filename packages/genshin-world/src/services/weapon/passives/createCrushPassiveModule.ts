import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const CRUSH_COOLDOWN_ID = "crush";
const CRUSH_COOLDOWN_SECONDS = 15;

// Crush at its rank: each normal or charged attack hit has the rank's chance of an extra hit at the rank's multiplier of
// ATK, on the area, and a proc holds off the next for fifteen seconds
export const createCrushPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(context, combatant, CRUSH_COOLDOWN_ID, CRUSH_COOLDOWN_SECONDS, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
