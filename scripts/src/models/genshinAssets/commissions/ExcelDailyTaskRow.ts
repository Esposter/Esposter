// One daily task of the game's table: its city and pool, its type and finish by the dump's names, where it is set and the
// Radius it begins and ends in, its finish count, its groups a scene task swaps, its quest, and its reward tier. The dump
// Leaves out a center position, type or finish that holds its default, which the commissions constants name
export interface ExcelDailyTaskRow {
  centerPosition?: string;
  cityId: number;
  enterDistance: number;
  exitDistance: number;
  finishProgress: number;
  finishType?: string;
  id: number;
  newGroupVec: number[];
  oldGroupVec: number[];
  poolId: number;
  questId: number;
  taskRewardId: number;
  type?: string;
}
