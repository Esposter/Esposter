import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsEnemyAffectedByElement } from "#src/services/combat/aura/checkIsEnemyAffectedByElement";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const FROST_BURIAL_COOLDOWN_ID = "frostBurialCooldown";

// Frost Burial at its rank: a normal or charged attack hit its wielder deals has the rank's chance of an Everfrost Icicle
// Above the enemy it struck, dealing the rank's multiplier of ATK as AoE DMG, or the Cryo multiplier on an enemy under Cryo,
// Once every the rank's cooldown in seconds. The enemy's Cryo is read as the hit lands; the icicle's area is provisional
export const createFrostBurialPassiveModule = (params: number[]): PassiveModule => {
  const chance = takeOne(params, 0);
  const talentMultiplier = takeOne(params, 1);
  const cryoTalentMultiplier = takeOne(params, 2);
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
        FROST_BURIAL_COOLDOWN_ID,
        cooldownSeconds,
        {
          hitArea: SMALL_AOE_AREA,
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: checkIsEnemyAffectedByElement(event.enemy, Element.Cryo)
            ? cryoTalentMultiplier
            : talentMultiplier,
        },
        event.enemy,
      );
    },
  };
};
