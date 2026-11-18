import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { checkIsOwnDamageTaken } from "#src/services/kit/checkIsOwnDamageTaken";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { takeOne } from "@esposter/shared";

const UNTAINTED_DESIRE_ID = "untaintedDesire";

// Untainted Desire at its rank: each Elemental Skill hit its wielder deals adds a stack, raising its ATK and Energy Recharge
// By the rank's amounts per stack for its seconds, up to the rank's count of stacks. A hit counts whether or not the wielder
// Is on the field
export const createUntaintedDesirePassiveModule = (params: number[]): PassiveModule => {
  const seconds = takeOne(params, 0);
  const attackPercentPerStack = takeOne(params, 1);
  const energyRechargePerStack = takeOne(params, 2);
  const maximumStacks = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (!checkIsOwnDamageTaken(event, combatant) || event.attackTag !== AttackTag.ElementalSkill) return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: UNTAINTED_DESIRE_ID,
        maximumStacks,
        perStackBonuses: [
          { amount: attackPercentPerStack, attribute: Attribute.AttackPercent },
          { amount: energyRechargePerStack, attribute: Attribute.EnergyRecharge },
        ],
        seconds,
      });
    },
  };
};
