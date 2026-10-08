import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";
import type { AbyssStarCondition } from "genshin-world";

import { TOWER_COND_LEFT_TIME, TOWER_COND_MONOLITH_HEALTH } from "#src/services/genshinAssets/spiralAbyss/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { AbyssStarConditionKind } from "genshin-world";

// One star condition of a chamber read from its level row. The time star's mark is the condition's second argument, the
// Seconds, and the monolith's is its third, the percent. A condition of any other kind is refused rather than dropped
export const toAbyssStarCondition = (
  { argumentList, towerCondType }: ExcelTowerLevelRow["conds"][number],
  levelId: number,
): AbyssStarCondition => {
  if (towerCondType === TOWER_COND_LEFT_TIME) {
    const seconds = argumentList.at(1);
    if (seconds === undefined)
      throw new InvalidOperationError(Operation.Read, String(levelId), "has no seconds for its time star");
    return { kind: AbyssStarConditionKind.LeftTime, threshold: seconds };
  }
  if (towerCondType === TOWER_COND_MONOLITH_HEALTH) {
    const percent = argumentList.at(2);
    if (percent === undefined)
      throw new InvalidOperationError(Operation.Read, String(levelId), "has no percent for its monolith star");
    return { kind: AbyssStarConditionKind.MonolithHealth, threshold: percent };
  }
  throw new InvalidOperationError(Operation.Read, String(levelId), `has an unknown star condition ${towerCondType}`);
};
