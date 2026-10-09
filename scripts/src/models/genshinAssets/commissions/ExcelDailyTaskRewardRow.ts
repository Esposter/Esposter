// One reward tier of the game's daily task reward table: its id, which a task names as its tier, and the reward preview each
// Adventure Rank band pays, in band order from the lowest
export interface ExcelDailyTaskRewardRow {
  dropVec: { dropId: number; previewRewardId: number }[];
  ID: number;
}
