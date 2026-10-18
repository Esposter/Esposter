import type { ElementalState } from "#src/models/combat/ElementalState";
import type { Element } from "#src/models/Element";

import { computeSightElement } from "#src/services/elementalSight/computeSightElement";
import { SIGHT_UNAFFECTED_COLOR } from "#src/services/elementalSight/constants";
import { ElementSightColorMap } from "#src/services/elementalSight/ElementSightColorMap";

// The colour an enemy is lit in under the sight: its element's colour where an element is on it, white where none is
export const computeEnemySightColor = (elementalState: ElementalState, enemyElement: Element | undefined): string => {
  const element = computeSightElement(elementalState, enemyElement);
  return element === undefined ? SIGHT_UNAFFECTED_COLOR : ElementSightColorMap[element];
};
