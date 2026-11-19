import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";

import { MONSTER_CURVE_TABLE_NAME } from "#src/services/genshinAssets/enemies/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The curve table's rows by level, ascending, which every level curve and stage enemy reads
export const readMonsterCurveRows = (): MonsterCurveRow[] =>
  readExcelTable<MonsterCurveRow>(MONSTER_CURVE_TABLE_NAME).toSorted(
    (firstRow, secondRow) => firstRow.level - secondRow.level,
  );
