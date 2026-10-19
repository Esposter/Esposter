import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsNormalOrChargedAttack } from "#src/services/kit/checkIsNormalOrChargedAttack";
import { checkIsKitShielded } from "#src/services/kit/effects/checkIsKitShielded";
import { checkIsCharacterOnField } from "#src/services/party/checkIsCharacterOnField";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { takeOne } from "@esposter/shared";

// Diffusing Boundary (Calamity of Eshu) at its rank: while a shield protects its wielder, its Normal and Charged
// Attacks deal the rank's DMG Bonus more and take the rank's CRIT Rate, as gcsim's calamityofeshu.go reads
// CharacterIsShielded
export const createDiffusingBoundaryPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const criticalRateBonus = takeOne(params, 1);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, deployedCombatants, effects) =>
      checkIsKitShielded(effects, checkIsCharacterOnField(deployedCombatants, characterId))
        ? [
            { amount: damageBonus, attribute: Attribute.NormalAttackDamageBonus },
            { amount: damageBonus, attribute: Attribute.ChargedAttackDamageBonus },
          ]
        : [],
    getStrikeCriticalRateBonus: ({ attackTag, combatant }, _enemy, party, effects) =>
      checkIsNormalOrChargedAttack(attackTag) &&
      checkIsKitShielded(effects, combatant.characterId === getActiveCharacterId(party))
        ? criticalRateBonus
        : 0,
  };
};
