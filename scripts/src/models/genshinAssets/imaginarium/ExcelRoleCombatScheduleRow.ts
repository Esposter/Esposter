// The fields read off one row of the game's Imaginarium Theater schedule: a season's id, the moments it begins and ends, the
// Reward group its Stellas draw from, and the difficulty ids it runs, each the id of one of the table's difficulty rows. The
// Dump scrambles the end and the difficulty list: the end is the season's last moment, and the list's ids are the
// Difficulty rows of the season's levels, read by their values since the names are scrambled
export interface ExcelRoleCombatScheduleRow {
  beginTimeStr: string;
  NCDJOKEHKLG: string;
  OLAEBCGKNLJ: number[];
  rewardGroupId: number;
  scheduleId: number;
}
