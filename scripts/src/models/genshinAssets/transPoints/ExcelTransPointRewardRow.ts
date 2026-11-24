// One row of the game's transport point reward table: the point it pays for, in its scene, and the reward its first
// Unlock gives from the reward table
export interface ExcelTransPointRewardRow {
  pointId: number;
  rewardId: number;
  sceneId: number;
}
