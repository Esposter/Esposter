import type { Fish } from "genshin-world";

export const toFish = (row: Fish, categoryTagId: number | undefined): Fish => ({
  attractRange: row.attractRange,
  biteTimeout: row.biteTimeout,
  bonusDuration: row.bonusDuration,
  bonusOffset: row.bonusOffset,
  bonusSpeed: row.bonusSpeed,
  bonusWidth: row.bonusWidth,
  categoryTagId,
  feelerTimes: row.feelerTimes,
  fleeRange: row.fleeRange,
  hp: row.hp,
  id: row.id,
  itemId: row.itemId,
  monsterId: row.monsterId,
  proficientId: row.proficientId,
  rewardId: row.rewardId,
  skillId: row.skillId,
});
