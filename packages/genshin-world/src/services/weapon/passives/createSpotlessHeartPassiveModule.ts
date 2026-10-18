import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { takeOne } from "@esposter/shared";

const SPOTLESS_HEART_COOLDOWN_ID = "spotlessHeartCooldown";
const SPOTLESS_HEART_ID = "spotlessHeart";

// Spotless Heart at its rank: an Elemental Skill its wielder deals has its base damage raised by the rank's share of DEF,
// The raise stands while the effect does. A use of the skill triggers the effect at most once in the cooldown.
// It stands until the rank's clear seconds after the skill's last hit. The rank's second value is not described by the text and is not read
export const createSpotlessHeartPassiveModule = (params: number[]): WeaponPassiveModule => {
  const defenseShare = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 2);
  const clearSeconds = takeOne(params, 3);
  return {
    getStrikeAdditiveBaseDamageBonus: (strike, _enemy, party, effects, characterIdCombatantMap) => {
      if (
        strike.attackTag !== AttackTag.ElementalSkill ||
        !checkIsKitStatusActive(effects, strike.combatant.characterId, SPOTLESS_HEART_ID)
      )
        return 0;
      return (
        defenseShare * getBuffedCombatant(strike.combatant, effects, party, characterIdCombatantMap).attributes.defense
      );
    },
    onKitEvent: (event, context, combatant) => {
      const { characterId } = combatant;
      const { effects } = context.kitEffectState;
      if (event.kind === KitEventKind.SkillUsed && event.characterId === characterId) {
        if (checkIsKitStatusActive(effects, characterId, SPOTLESS_HEART_COOLDOWN_ID)) return;
        addKitStatus(context.kitEffectState, characterId, {
          id: SPOTLESS_HEART_COOLDOWN_ID,
          secondsRemaining: cooldownSeconds,
        });
        addKitStatus(context.kitEffectState, characterId, {
          id: SPOTLESS_HEART_ID,
          secondsRemaining: Number.POSITIVE_INFINITY,
        });
      } else if (
        event.kind === KitEventKind.DamageTaken &&
        event.striker.characterId === characterId &&
        event.attackTag === AttackTag.ElementalSkill &&
        checkIsKitStatusActive(effects, characterId, SPOTLESS_HEART_ID)
      )
        addKitStatus(context.kitEffectState, characterId, { id: SPOTLESS_HEART_ID, secondsRemaining: clearSeconds });
    },
  };
};
