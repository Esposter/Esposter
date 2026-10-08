import type { ExcelPlayerLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelRow";

import { EXPEDITION_LIMITS_RELATIVE_PATH } from "#src/services/genshinAssets/expeditions/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";

// The Adventure Ranks that raise how many expeditions may be out at once, each with its raise, as the world's data
export const writeExpeditionLimits = (): Promise<string> => {
  const limits = readExcelTable<ExcelPlayerLevelRow>("PlayerLevelExcelConfigData")
    .filter(({ expeditionLimitAdd }) => expeditionLimitAdd > 0)
    .map(({ expeditionLimitAdd, level }) => ({ expeditionLimitAdd, level }))
    .toSorted((firstLimit, secondLimit) => firstLimit.level - secondLimit.level);
  return writeWorldData(EXPEDITION_LIMITS_RELATIVE_PATH, limits);
};
