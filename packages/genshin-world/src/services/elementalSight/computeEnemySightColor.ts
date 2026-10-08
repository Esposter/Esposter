import type { ElementalState } from "#src/models/combat/ElementalState";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";

import { computeSightElement } from "#src/services/elementalSight/computeSightElement";
import { SIGHT_UNAFFECTED_COLOR } from "#src/services/elementalSight/constants";
import { ElementSightColorMap } from "#src/services/elementalSight/ElementSightColorMap";
import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";

// The colour an enemy is lit in under the sight: its element's colour where an element is on it, white where none is
export const computeEnemySightColor = (elementalState: ElementalState, enemyKindId: EnemyKindId): string => {
  const element = computeSightElement(elementalState, EnemyKindTraitsMap[enemyKindId].element);
  return element === undefined ? SIGHT_UNAFFECTED_COLOR : ElementSightColorMap[element];
};
