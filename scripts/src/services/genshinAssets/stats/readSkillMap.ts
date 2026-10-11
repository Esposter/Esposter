import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The game's skills by their IDs
export const readSkillMap = () =>
  new Map(readExcelTable<ExcelSkillRow>("AvatarSkillExcelConfigData").map((row) => [row.id, row]));
