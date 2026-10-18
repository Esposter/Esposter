import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";

import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The game's skill depots by their IDs, each one a character's sets of skills
export const readSkillDepotMap = (): Map<ExcelSkillDepotRow["id"], ExcelSkillDepotRow> =>
  new Map(readExcelTable<ExcelSkillDepotRow>("AvatarSkillDepotExcelConfigData").map((row) => [row.id, row]));
