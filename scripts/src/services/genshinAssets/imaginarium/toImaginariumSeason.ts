import type { ExcelRoleCombatScheduleRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatScheduleRow";
import type { ImaginariumSeason } from "genshin-world";

// One season from its schedule row: its id, the wall-clock moments it begins and ends in the game's time zone, the reward
// Group its Stellas draw from, and the difficulties it runs by id
export const toImaginariumSeason = (row: ExcelRoleCombatScheduleRow): ImaginariumSeason => ({
  beginsAt: row.beginTimeStr.replace(" ", "T"),
  difficultyIds: row.OLAEBCGKNLJ,
  endsAt: row.NCDJOKEHKLG.replace(" ", "T"),
  id: row.scheduleId,
  rewardGroup: row.rewardGroupId,
});
