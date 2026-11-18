import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { takeOne } from "@esposter/shared";

const NORTHWIND_WOLF_SKILL_ID = "northwindWolfSkill";
const NORTHWIND_WOLF_BURST_ID = "northwindWolfBurst";

// Northwind Wolf at its rank: its wielder's Elemental Skill and Burst DMG rise by the rank's first amount. Each Elemental Skill
// Hit adds a stack of CRIT Rate, and each burst hit a stack of its own, each for the rank's seconds, up to the rank's stacks,
// And a stack at most once every cooldown
export const createNorthwindWolfPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const skillSeconds = takeOne(params, 1);
  const skillMaximumStacks = takeOne(params, 2);
  const skillCriticalRate = takeOne(params, 3);
  const burstSeconds = takeOne(params, 4);
  const burstMaximumStacks = takeOne(params, 5);
  const burstCriticalRate = takeOne(params, 6);
  const cooldownSeconds = takeOne(params, 7);
  return {
    getStrikeDamageBonus: (strike) =>
      strike.attackTag === AttackTag.ElementalSkill || strike.attackTag === AttackTag.ElementalBurst ? damageBonus : 0,
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.attackTag === AttackTag.ElementalSkill)
        addPassiveStack(kitEffectState, combatant.characterId, {
          cooldownSeconds,
          id: NORTHWIND_WOLF_SKILL_ID,
          maximumStacks: skillMaximumStacks,
          perStackBonuses: [{ amount: skillCriticalRate, attribute: Attribute.CriticalRate }],
          seconds: skillSeconds,
        });
      else if (event.attackTag === AttackTag.ElementalBurst)
        addPassiveStack(kitEffectState, combatant.characterId, {
          cooldownSeconds,
          id: NORTHWIND_WOLF_BURST_ID,
          maximumStacks: burstMaximumStacks,
          perStackBonuses: [{ amount: burstCriticalRate, attribute: Attribute.CriticalRate }],
          seconds: burstSeconds,
        });
    },
  };
};
