import type { ExcelDailyTaskLevelRow } from "#src/models/genshinAssets/commissions/ExcelDailyTaskLevelRow";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { COMMISSION_RANK_BAND_COUNT, COMMISSION_RANK_BAND_SIZE } from "genshin-world";

// The level table must be the game's bands: twelve of five ranks each in order from rank one, since a claim reads its band
// Off the rank alone and a table of other bands would pay every rank the wrong reward
export const checkLevelBands = (levelRows: ExcelDailyTaskLevelRow[]): void => {
  const isGameBands =
    levelRows.length === COMMISSION_RANK_BAND_COUNT &&
    levelRows.every(
      ({ ID, maxPlayerLevel, minPlayerLevel }, index) =>
        ID === index + 1 &&
        minPlayerLevel === index * COMMISSION_RANK_BAND_SIZE + 1 &&
        maxPlayerLevel === (index + 1) * COMMISSION_RANK_BAND_SIZE,
    );
  if (!isGameBands)
    throw new InvalidOperationError(
      Operation.Read,
      "DailyTaskLevelExcelConfigData",
      "is not the game's twelve bands of five ranks from rank one",
    );
};
