import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { takeOne } from "@esposter/shared";

const NORTHWIND_WOLF_SKILL_ID = "northwindWolfSkill";
const NORTHWIND_WOLF_BURST_ID = "northwindWolfBurst";

// Northwind Wolf at its rank: its wielder's Elemental Skill and Burst DMG rise by the rank's first amount.
// Each Elemental Skill hit adds a stack of CRIT Rate, and each burst hit a stack of its own, for the rank's seconds.
// Each holds up to the rank's stacks, and a stack is added at most once every cooldown
export const createNorthwindWolfPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const skillSeconds = takeOne(params, 1);
  const skillMaximumStacks = takeOne(params, 2);
  const skillCriticalRate = takeOne(params, 3);
  const burstSeconds = takeOne(params, 4);
  const burstMaximumStacks = takeOne(params, 5);
  const burstCriticalRate = takeOne(params, 6);
  const cooldownSeconds = takeOne(params, 7);
  const skillStack = {
    criticalRate: skillCriticalRate,
    id: NORTHWIND_WOLF_SKILL_ID,
    maximumStacks: skillMaximumStacks,
    seconds: skillSeconds,
  };
  const burstStack = {
    criticalRate: burstCriticalRate,
    id: NORTHWIND_WOLF_BURST_ID,
    maximumStacks: burstMaximumStacks,
    seconds: burstSeconds,
  };
  return {
    getStrikeDamageBonus: (strike) =>
      strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      const stack =
        event.attackTag === AttackTag.ElementalSkill
          ? skillStack
          : event.attackTag === AttackTag.ElementalBurst
            ? burstStack
            : undefined;
      if (stack !== undefined)
        addPassiveStack(kitEffectState, combatant.characterId, {
          cooldownSeconds,
          id: stack.id,
          maximumStacks: stack.maximumStacks,
          perStackBonuses: [{ amount: stack.criticalRate, attribute: Attribute.CriticalRate }],
          seconds: stack.seconds,
        });
    },
  };
};
