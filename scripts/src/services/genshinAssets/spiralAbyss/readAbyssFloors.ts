import type { ExcelTowerFloorRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerFloorRow";
import type { ExcelTowerLevelRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerLevelRow";

import { TOWER_FLOOR_TABLE_NAME, TOWER_LEVEL_TABLE_NAME } from "#src/services/genshinAssets/spiralAbyss/constants";
import { toAbyssFloor } from "#src/services/genshinAssets/spiralAbyss/toAbyssFloor";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The Spiral Abyss's floors with their chambers, read from the tower's floor and level tables in ascending order of the floor's id
export const readAbyssFloors = (): ReturnType<typeof toAbyssFloor>[] => {
  const levelRows = readExcelTable<ExcelTowerLevelRow>(TOWER_LEVEL_TABLE_NAME);
  return readExcelTable<ExcelTowerFloorRow>(TOWER_FLOOR_TABLE_NAME)
    .map((row) =>
      toAbyssFloor(
        row,
        levelRows.filter(({ levelGroupId }) => levelGroupId === row.levelGroupId),
      ),
    )
    .toSorted((firstFloor, secondFloor) => firstFloor.id - secondFloor.id);
};
