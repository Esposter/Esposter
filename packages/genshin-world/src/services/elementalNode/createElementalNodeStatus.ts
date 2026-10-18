import type { Element } from "#src/models/Element";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";

import { Elements } from "#src/models/Element";
import {
  ELEMENTAL_NODE_ELEMENT_RESISTANCE_REDUCTION,
  ELEMENTAL_NODE_RESISTANCE_REDUCTION,
} from "#src/services/elementalNode/constants";
import { getElementalNodeStatusId } from "#src/services/elementalNode/getElementalNodeStatusId";

// The status a node's buff gives an enemy for as long as the buff lasts: the RES it gains to every element and to
// Physical hits, and the extra to its node's own element. It has no seconds of its own, since a reaction ends it
export const createElementalNodeStatus = (element: Element): EnemyStatus => ({
  damageTakenBonus: 0,
  id: getElementalNodeStatusId(element),
  physicalResistanceReduction: ELEMENTAL_NODE_RESISTANCE_REDUCTION,
  resistanceReduction: Object.fromEntries(
    Elements.map((resistedElement) => [
      resistedElement,
      resistedElement === element
        ? ELEMENTAL_NODE_RESISTANCE_REDUCTION + ELEMENTAL_NODE_ELEMENT_RESISTANCE_REDUCTION
        : ELEMENTAL_NODE_RESISTANCE_REDUCTION,
    ]),
  ),
  secondsRemaining: Infinity,
});
