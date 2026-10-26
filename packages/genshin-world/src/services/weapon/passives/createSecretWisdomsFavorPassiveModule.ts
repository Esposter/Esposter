import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { takeOne } from "@esposter/shared";

// Secret Wisdom's Favor at its rank: a charged attack hit its wielder deals raises its Elemental Mastery by the rank's amount
// Per stack, up to the rank's maximum stacks for the rank's seconds, a stack at most once every the rank's cooldown in seconds
export const createSecretWisdomsFavorPassiveModule = (params: number[]): PassiveModule => {
  const elementalMastery = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const maximumStacks = takeOne(params, 2);
  const cooldownSeconds = takeOne(params, 3);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        cooldownSeconds,
        id: "secretWisdomsFavor",
        maximumStacks,
        perStackBonuses: [{ amount: elementalMastery, attribute: Attribute.ElementalMastery }],
        seconds,
      });
    },
  };
};
