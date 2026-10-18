// The fields read off one row of the game's Imaginarium Theater schedule: a season's id, the moments it begins and ends, the
// Reward group its Stellas draw from, the difficulty ids it runs, each a level id of the table of levels and one of its
// Difficulty rows, and the avatar config id its cast is read by. The dump scrambles two keys, read under the keys the dump
// Holds at 7.1: `endTimeStr` is `IENPIBICGCC`, the season's last moment (29 of 29 seasons' wiki end), and `difficultyIds` is
// `LNCBPPGCCOA` (all 128 of its ids are rows of the levels, the difficulties and the fight rules)
export interface ExcelRoleCombatScheduleRow {
  avatarConfigId: number;
  beginTimeStr: string;
  difficultyIds: number[];
  endTimeStr: string;
  rewardGroupId: number;
  scheduleId: number;
}
