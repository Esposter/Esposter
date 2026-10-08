import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";
import type { AbyssFloor } from "genshin-world";

import { toAbyssStarCondition } from "#src/services/genshinAssets/spiralAbyss/toAbyssStarCondition";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One floor from its floor row and the level rows of its level group, its chambers in their order. A floor is refused
// Unless its group holds three chambers, as the Abyss lays every floor out
export const toAbyssFloor = (row: ExcelTowerFloorRow, levelRows: ExcelTowerLevelRow[]): AbyssFloor => {
  if (levelRows.length !== 3)
    throw new InvalidOperationError(Operation.Read, String(row.floorId), `has ${levelRows.length} chambers, not three`);
  return {
    chambers: levelRows
      .toSorted((firstLevel, secondLevel) => firstLevel.levelIndex - secondLevel.levelIndex)
      .map((levelRow) => ({
        conditions: levelRow.conds.map((condition) => toAbyssStarCondition(condition, levelRow.levelId)),
        id: levelRow.levelId,
        index: levelRow.levelIndex,
      })),
    id: row.floorId,
    index: row.floorIndex,
    teamCount: row.teamNum,
    unlockStarCount: row.unlockStarCount,
  };
};
