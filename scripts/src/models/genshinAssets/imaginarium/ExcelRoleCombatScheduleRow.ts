// The fields read off one row of the game's Imaginarium Theater schedule: a season's id, the moments it begins and ends, the
// Reward group its Stellas draw from, the difficulty ids it runs, each the id of one of the table's difficulty rows, and the
// Avatar config id its cast is read by. The dump scrambles the end and the difficulty list: the end is the season's last
// Moment, and the list's ids are the difficulty rows of the season's levels, read by their values since the names are scrambled
export interface ExcelRoleCombatScheduleRow {
  avatarConfigId: number;
  beginTimeStr: string;
  IENPIBICGCC: string;
  LNCBPPGCCOA: number[];
  rewardGroupId: number;
  scheduleId: number;
}
