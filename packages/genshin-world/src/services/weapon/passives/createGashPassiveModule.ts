import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const GASH_COOLDOWN_ID = "gashCooldown";

// Gash at its rank: a hit its wielder deals has the rank's chance of an extra hit at the rank's multiplier of ATK on the one
// Enemy it struck, once per the rank's cooldown in seconds. A passive's own extra hit has no attack tag, so it never procs another
export const createGashPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag === undefined ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(
        context,
        combatant,
        GASH_COOLDOWN_ID,
        cooldownSeconds,
        { hitArea: event.hit.hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
        event.enemy,
      );
    },
  };
};
