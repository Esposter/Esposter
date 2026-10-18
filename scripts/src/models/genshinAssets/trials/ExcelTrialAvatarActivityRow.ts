// One stage of the game's trial activity table: the dungeon it is fought in, the trial avatar it fights with, the place that
// Avatar holds in its event and the first-clear reward it pays
export interface ExcelTrialAvatarActivityRow {
  dungeonId: number;
  firstPassReward: number;
  id: number;
  trialAvatarId: number;
  trialAvatarIndexId: number;
}
