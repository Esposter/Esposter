import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";
import type {
  ExcelGcgWeekRewardItem,
  ExcelGcgWeekRewardRow,
} from "#src/models/genshinAssets/gcg/ExcelGcgWeekRewardRow";
import type { ResidentWeekGame } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { GCG_LUCKY_COIN_ITEM_ID, GCG_PLAYER_EXP_ITEM_ID } from "genshin-world";

// The count of one item a level's week reward pays, zero when the reward holds no such item
const getRewardCount = (items: ExcelGcgWeekRewardItem[], itemId: number): number =>
  items.find((item) => item.itemId === itemId)?.NIEOALBMDMB ?? 0;

// The week games each listed NPC's week row offers, each at the level its row names, with the Lucky Coins and Player EXP
// The level's week reward pays. A level whose reward holds no Player EXP item pays none, and a level with no reward row is
// Refused, since the game would be priced at a level the table does not price
export const toResidentWeekGames = (
  weekLevelRows: ExcelGcgWeekLevelRow[],
  weekRewardRows: ExcelGcgWeekRewardRow[],
  npcIds: readonly number[],
): Map<string, ResidentWeekGame[]> => {
  const rewardItemsMap = new Map(weekRewardRows.map(({ gcgLevel, items }) => [gcgLevel, items]));
  return new Map(
    weekLevelRows
      .filter(({ levelCondList, npcId }) => npcIds.includes(npcId) && levelCondList.length > 0)
      .map(({ levelCondList, npcId }) => [
        String(npcId),
        levelCondList.map(({ gcgLevel, levelId }): ResidentWeekGame => {
          const items = rewardItemsMap.get(gcgLevel);
          if (items === undefined)
            throw new InvalidOperationError(
              Operation.Read,
              "week reward",
              `the week reward table holds no row for level ${gcgLevel}`,
            );
          return {
            gameId: levelId,
            gcgLevel,
            luckyCoins: getRewardCount(items, GCG_LUCKY_COIN_ITEM_ID),
            playerExp: getRewardCount(items, GCG_PLAYER_EXP_ITEM_ID),
          };
        }),
      ]),
  );
};
