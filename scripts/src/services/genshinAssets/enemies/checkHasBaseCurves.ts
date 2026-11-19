import type { MonsterRow } from "#src/models/genshinAssets/enemies/MonsterRow";

import {
  BASE_ATTACK_PROPERTY,
  BASE_DEFENSE_PROPERTY,
  BASE_HEALTH_PROPERTY,
} from "#src/services/genshinAssets/enemies/constants";

// Whether a monster grows its health, attack and defense by a curve each, the three the game scales its stats by
export const checkHasBaseCurves = ({ propGrowCurves }: Pick<MonsterRow, "propGrowCurves">): boolean =>
  [BASE_HEALTH_PROPERTY, BASE_ATTACK_PROPERTY, BASE_DEFENSE_PROPERTY].every((property) =>
    propGrowCurves.some(({ type }) => type === property),
  );
