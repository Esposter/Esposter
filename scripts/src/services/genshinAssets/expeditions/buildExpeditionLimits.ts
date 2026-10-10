import type { ExcelPlayerLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelRow";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The Adventure Ranks that raise how many expeditions may be out at once, each with its raise, as one record of the
// Expeditions dataset
export const buildExpeditionLimits = (): Record<string, unknown> => {
  const limits = readExcelTable<ExcelPlayerLevelRow>("PlayerLevelExcelConfigData")
    .filter(({ expeditionLimitAdd }) => expeditionLimitAdd > 0)
    .map(({ expeditionLimitAdd, level }) => ({ expeditionLimitAdd, level }))
    .toSorted((firstLimit, secondLimit) => firstLimit.level - secondLimit.level);
  return { [`${GameDataset.Expeditions}/limits`]: limits };
};
