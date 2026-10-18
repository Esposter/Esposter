import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const JUSTICE_COOLDOWN_ID = "justiceCooldown";

// Justice at its rank: the normal and charged attacks its wielder deals are raised by the rank's DMG Bonus, and a critical hit
// By one of them restores the wielder the rank's share of its ATK as HP, once every the rank's cooldown seconds. The rank's
// Fourth value is not in the text and is not read
export const createJusticePassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  const attackShare = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    getStrikeDamageBonus: (strike) => (checkIsNormalOrChargedAttack(strike.attackTag) ? damageBonus : 0),
    onKitEvent: (event, context, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        !event.isCritical ||
        !checkIsNormalOrChargedAttack(event.attackTag) ||
        checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, JUSTICE_COOLDOWN_ID)
      )
        return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: JUSTICE_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      changeKitMemberHealth(context, combatant, combatant.characterId, combatant.attributes.attack * attackShare);
    },
  };
};
