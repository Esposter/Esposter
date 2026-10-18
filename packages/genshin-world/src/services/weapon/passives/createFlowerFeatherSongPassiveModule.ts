import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

const NATLAN_REGION_ID = "natlan";
// The counted members the passive's Elemental Mastery needs, as its text gives them
const MEMBERS_FOR_ELEMENTAL_MASTERY = 3;

// Flower-Feather Song at its rank: the wielder's ATK rises by the rank's percentage for each other party member from Natlan
// Or of another Elemental Type, and with no fewer than three of them its Elemental Mastery rises by the rank's amount
export const createFlowerFeatherSongPassiveModule = (params: number[]): WeaponPassiveModule => {
  const attackPercentPerMember = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const count = deployedCombatants.filter(
        (member) =>
          member.characterId !== combatant.characterId &&
          (member.regionId === NATLAN_REGION_ID || member.element !== combatant.element),
      ).length;
      return [
        { amount: attackPercentPerMember * count, attribute: Attribute.AttackPercent },
        {
          amount: count >= MEMBERS_FOR_ELEMENTAL_MASTERY ? elementalMastery : 0,
          attribute: Attribute.ElementalMastery,
        },
      ];
    },
  };
};
