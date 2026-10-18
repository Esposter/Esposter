import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const BOLT_COOLDOWN_ID = "boltOfPerceptionCooldown";

// Echo at its rank: a normal or charged attack its wielder lands has the rank's chance of a Bolt of Perception, an extra hit at
// The rank's multiplier of ATK on the enemy it struck, once every the rank's cooldown in seconds. The bolt's bounces, which the
// Text gives as a maximum of four, are not modelled, so the bolt is a single hit provisionally
export const createBoltOfPerceptionPassiveModule = (params: number[]): WeaponPassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(
        context,
        combatant,
        BOLT_COOLDOWN_ID,
        cooldownSeconds,
        { hitArea: event.hit.hitArea, hitmarkSeconds: 0, poiseDamage: 0, talentMultiplier },
        event.enemy,
      );
    },
  };
};
