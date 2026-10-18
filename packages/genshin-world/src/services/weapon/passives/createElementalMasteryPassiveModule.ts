import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addPassiveStack } from "#src/services/weapon/passives/addPassiveStack";
import { ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES } from "#src/services/weapon/passives/constants";
import { takeOne } from "@esposter/shared";

const ELEMENTAL_MASTERY_MAXIMUM_STACKS = 2;

// Elemental Mastery at its rank: each normal attack hit its wielder deals raises every elemental DMG bonus by the rank's
// Percentage per stack, up to two stacks for the rank's seconds
export const createElementalMasteryPassiveModule = (params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.DamageTaken ||
        event.striker.characterId !== combatant.characterId ||
        event.attackTag !== AttackTag.NormalAttack
      )
        return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: "elementalMastery",
        maximumStacks: ELEMENTAL_MASTERY_MAXIMUM_STACKS,
        perStackBonuses: ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES.map((attribute) => ({ amount: damageBonus, attribute })),
        seconds,
      });
    },
  };
};
