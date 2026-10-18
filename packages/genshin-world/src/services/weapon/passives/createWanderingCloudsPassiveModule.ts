import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES, SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const WANDERING_CLOUDS_COOLDOWN_ID = "wanderingClouds";

// Skyward Atlas's Wandering Clouds at its rank: its Elemental DMG Bonus is a passive bonus on the wielder. A Normal Attack hit
// Of the wielder's own has the rank's chance to earn the favour of the clouds, which queues a physical small AoE at the rank's
// Multiplier of ATK, once every rank's cooldown in seconds. The clouds' fifteen seconds of seeking out opponents are not modelled
// Beyond that single hit, which is provisional
export const createWanderingCloudsPassiveModule = (params: number[]): WeaponPassiveModule => {
  const elementalDamageBonus = takeOne(params, 0);
  const chance = takeOne(params, 1);
  const talentMultiplier = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    getPassiveBonuses: () =>
      ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: elementalDamageBonus, attribute })),
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.NormalAttack ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, WANDERING_CLOUDS_COOLDOWN_ID) ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(context, combatant, WANDERING_CLOUDS_COOLDOWN_ID, cooldownSeconds, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
