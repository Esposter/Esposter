import type { ExcelTowerRewardRow } from "#src/models/genshinAssets/spiralAbyss/ExcelTowerRewardRow";
import type { AbyssFloorReward } from "genshin-world";

// The rewards of one floor in one reward group, read off its reward row as the table names them
export const toAbyssFloorReward = (row: ExcelTowerRewardRow): AbyssFloorReward => ({
  chamberRewardIds: row.rewardIdRoom,
  floorIndex: row.floor,
  nineStarRewardId: row.rewardId9Stars,
  rewardGroup: row.rewardGroup,
  sixStarRewardId: row.rewardId6Stars,
  threeStarRewardId: row.rewardId3Stars,
});
