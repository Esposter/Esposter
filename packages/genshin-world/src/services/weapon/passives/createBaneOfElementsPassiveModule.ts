import type { Element } from "#src/models/Element";
import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { ElementAuraTypeMap } from "#src/services/combat/aura/ElementAuraTypeMap";
import { takeOne } from "@esposter/shared";

// A Bane passive at its rank: the DMG Bonus its wielder's strikes take on an enemy under the aura of either of its two
// Elements, the rank's first number, which is the passive's bonus whichever pair of elements it names
export const createBaneOfElementsPassiveModule = (elements: Element[], params: number[]): WeaponPassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (_strike, enemy) =>
      elements.some((element) => {
        const auraType = ElementAuraTypeMap[element];
        return auraType !== undefined && enemy.elementalState.auras.has(auraType);
      })
        ? damageBonus
        : 0,
  };
};
