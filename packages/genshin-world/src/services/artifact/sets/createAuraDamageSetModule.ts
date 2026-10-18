import type { Element } from "#src/models/Element";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { checkIsEnemyAffectedByElement } from "#src/services/combat/aura/checkIsEnemyAffectedByElement";

// A set's bonus that raises the DMG its wearer's strikes deal to an enemy under the aura of the element by the amount, as
// The Electro and Pyro sets' bonuses do, each naming only its own element
export const createAuraDamageSetModule = ({
  amount,
  element,
}: {
  amount: number;
  element: Element;
}): PassiveModule => ({
  getStrikeDamageBonus: (_strike, enemy) => (checkIsEnemyAffectedByElement(enemy, element) ? amount : 0),
});
