import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { SMALL_AOE_AREA } from "#src/services/weapon/passives/constants";
import { queueCooldownHit } from "#src/services/weapon/passives/queueCooldownHit";
import { takeOne } from "@esposter/shared";

const BLACK_WING_COOLDOWN_ID = "blackWing";
const BLACK_WING_COOLDOWN_SECONDS = 2;

// Skyward Spine's Black Wing at its rank: its wielder's CRIT Rate and Normal Attack SPD are raised by the rank's two
// Percentages. A Normal or Charged Attack hit has the rank's chance to queue a vacuum blade of the rank's ATK share in a small AoE,
// Once every two seconds, which is the text's and not the parameter list's
export const createBlackWingPassiveModule = (params: number[]): WeaponPassiveModule => {
  const criticalRate = takeOne(params, 0);
  const normalAttackSpeed = takeOne(params, 1);
  const chance = takeOne(params, 2);
  const talentMultiplier = takeOne(params, 3);
  return {
    getPassiveBonuses: () => [
      { amount: criticalRate, attribute: Attribute.CriticalRate },
      { amount: normalAttackSpeed, attribute: Attribute.NormalAttackSpeed },
    ],
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, BLACK_WING_COOLDOWN_ID) ||
        context.random() >= chance
      )
        return;
      queueCooldownHit(context, combatant, BLACK_WING_COOLDOWN_ID, BLACK_WING_COOLDOWN_SECONDS, {
        hitArea: SMALL_AOE_AREA,
        hitmarkSeconds: 0,
        poiseDamage: 0,
        talentMultiplier,
      });
    },
  };
};
