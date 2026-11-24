import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { takeOne } from "@esposter/shared";

const WEIGHT_OF_FALLING_BRANCHES_SOURCE = "weightOfFallingBranches";
const PLUNGE_DAMAGE_ATTRIBUTES = [
  Attribute.NormalAttackDamageBonus,
  Attribute.ChargedAttackDamageBonus,
  Attribute.PlungingAttackDamageBonus,
];

// The Weight of Falling Branches at its rank: its Plunging Attack CRIT Rate by the rank's first amount, a static line
// Its plunges are priced with. A Plunging Attack its wielder hits with raises its Normal, Charged and Plunging Attack
// DMG by the rank's second amount for the rank's seconds
export const createWeightOfFallingBranchesPassiveModule = (params: number[]): PassiveModule => {
  const criticalRate = takeOne(params, 0);
  const damageBonus = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    getStrikeCriticalRateBonus: (strike) => (strike.attackTag === AttackTag.PlungingAttack ? criticalRate : 0),
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.PlungingAttack
      )
        return;
      for (const attribute of PLUNGE_DAMAGE_ATTRIBUTES)
        buffKitMember(kitEffectState, combatant.characterId, {
          amount: damageBonus,
          attribute,
          secondsRemaining: seconds,
          source: WEIGHT_OF_FALLING_BRANCHES_SOURCE,
        });
    },
  };
};
