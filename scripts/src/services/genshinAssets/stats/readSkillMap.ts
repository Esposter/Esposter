import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { readExcelTable } from "#src/services/genshinText/readExcelTable";

// The game's skills by their IDs
export const readSkillMap = (): Map<ExcelSkillRow["id"], ExcelSkillRow> =>
  new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
