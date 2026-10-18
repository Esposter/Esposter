import type { Element } from "#src/models/Element";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { checkIsEnemyAffectedByElement } from "#src/services/combat/aura/checkIsEnemyAffectedByElement";
import { takeOne } from "@esposter/shared";

// A Bane passive at its rank: the DMG Bonus its wielder's strikes take on an enemy under the aura of either of its two
// Elements, the rank's first number, which is the passive's bonus whichever pair of elements it names
export const createBaneOfElementsPassiveModule = (elements: Element[], params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  return {
    getStrikeDamageBonus: (_strike, enemy) =>
      elements.some((element) => checkIsEnemyAffectedByElement(enemy, element)) ? damageBonus : 0,
  };
};
