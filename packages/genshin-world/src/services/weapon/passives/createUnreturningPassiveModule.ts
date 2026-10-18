import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { takeOne } from "@esposter/shared";

// Unreturning at its rank: a charged attack hit on a weak point raises its wielder's Movement SPD and ATK for the seconds
// Given. A kit still sets no weak-point flag, so this waits on that data
export const createUnreturningPassiveModule = (params: number[]): WeaponPassiveModule => {
  const movementSpeed = takeOne(params, 0);
  const attackPercentage = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.ChargedAttack ||
        !event.hit.weakPoint
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: "unreturning",
        maximumStacks: 1,
        perStackBonuses: [
          { amount: movementSpeed, attribute: Attribute.MovementSpeed },
          { amount: attackPercentage, attribute: Attribute.AttackPercent },
        ],
        seconds,
      });
    },
  };
};
