import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const JUSTICE_COOLDOWN_ID = "justiceCooldown";

// Justice at its rank: the normal and charged attacks its wielder deals are raised by the rank's DMG Bonus, and a
// Critical hit by one of them restores the wielder the rank's share of its ATK as HP, once every cooldown seconds of the
// Rank. The rank's fourth value is not in the text and is not read
export const createJusticePassiveModule = (params: number[]): PassiveModule => {
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
        !startKitCooldown(context.kitEffectState, combatant.characterId, JUSTICE_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      const { attack } = getBuffedCombatant(
        combatant,
        context.kitEffectState.effects,
        context.party,
        context.characterIdCombatantMap,
      ).attributes;
      changeKitMemberHealth(context, combatant, combatant.characterId, attack * attackShare);
    },
  };
};
