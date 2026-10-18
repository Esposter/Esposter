import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const HEAVY_COOLDOWN_ID = "heavyCooldown";

// Heavy at its rank: each normal attack its wielder lands while active deals an extra hit at the rank's multiplier of ATK on
// The attack's area, once per the rank's cooldown in seconds
export const createHeavyPassiveModule = (params: number[]): WeaponPassiveModule => {
  const talentMultiplier = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.NormalAttackLanded ||
        context.activeCombatant.characterId !== combatant.characterId
      )
        return;
      queueCooldownHit(context, combatant, HEAVY_COOLDOWN_ID, cooldownSeconds, {
        hitArea: takeOne(event.action.hits, 0).hitArea,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
