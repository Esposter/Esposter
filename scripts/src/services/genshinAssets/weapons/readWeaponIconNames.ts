import type { ExcelWeaponRow } from "#src/models/genshinAssets/stats/ExcelWeaponRow";

import { WEAPON_TABLE_NAME } from "#src/services/genshinAssets/archive/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The icon name of every row of the weapon table, as the table holds them: a name two rows share appears twice
export const readWeaponIconNames = (): string[] =>
  readExcelTable<ExcelWeaponRow>(WEAPON_TABLE_NAME).map(({ icon }) => icon);
