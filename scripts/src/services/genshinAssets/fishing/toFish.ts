import type { ExcelFishRow } from "#src/models/genshinAssets/fishing/ExcelFishRow";
import type { Fish } from "genshin-world";

export const toFish = (row: ExcelFishRow): Fish => ({
  attractRange: row.attractRange,
  biteTimeout: row.biteTimeout,
  bonusDuration: row.bonusDuration,
  bonusOffset: row.bonusOffset,
  bonusSpeed: row.bonusSpeed,
  bonusWidth: row.bonusWidth,
  feelerTimes: row.feelerTimes,
  fishCateId: row.fishCateId,
  fleeRange: row.fleeRange,
  hp: row.hp,
  id: row.id,
  itemId: row.itemId,
  monsterId: row.monsterId,
  proficientId: row.proficientId,
  rewardId: row.rewardId,
  skillId: row.skillId,
});
