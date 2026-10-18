import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { takeOne } from "@esposter/shared";

const SKYWARD_BLADE_MIGHT_ID = "skypiercingMight";

// Skyward Blade's Sky-Piercing Fang at its rank: its CRIT Rate is a static line the rank carries. A burst its wielder uses
// Gives the wielder Movement SPD and Normal Attack SPD by the rank's shares, and its Normal and Charged Attack hits deal the
// Rank's share of ATK as base damage, for the rank's seconds. The share is the wielder's ATK with its buffs on, as a hit
// Reads it
export const createSkyPiercingFangPassiveModule = (params: number[]): WeaponPassiveModule => {
  const movementSpeedShare = takeOne(params, 1);
  const normalAttackSpeedShare = takeOne(params, 2);
  const damageShare = takeOne(params, 3);
  const seconds = takeOne(params, 4);
  return {
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (
        !checkIsNormalOrChargedAttack(strike.attackTag) ||
        !checkIsKitStatusActive(effects, strike.combatant.characterId, SKYWARD_BLADE_MIGHT_ID)
      )
        return 0;
      return (
        damageShare * getBuffedCombatant(strike.combatant, effects, party, characterIdCombatantMap).attributes.attack
      );
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.BurstUsed || event.characterId !== combatant.characterId) return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: SKYWARD_BLADE_MIGHT_ID,
        secondsRemaining: seconds,
      });
      for (const [attribute, amount] of [
        [Attribute.MovementSpeed, movementSpeedShare],
        [Attribute.NormalAttackSpeed, normalAttackSpeedShare],
      ] as const)
        buffKitMember(context.kitEffectState, combatant.characterId, {
          amount,
          attribute,
          secondsRemaining: seconds,
          source: SKYWARD_BLADE_MIGHT_ID,
        });
    },
  };
};
