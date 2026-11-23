import type { ExcelForgeUpdateRow } from "#src/models/genshinAssets/stats/ExcelForgeUpdateRow";

// The Adventure Rank each queue at the blacksmith opens at, by its queue's number less one
export const toForgeQueuePlayerLevels = (rows: readonly ExcelForgeUpdateRow[]): number[] =>
  rows
    .toSorted((firstRow, secondRow) => firstRow.forgeQueueNum - secondRow.forgeQueueNum)
    .map(({ playerLevel }) => playerLevel);
