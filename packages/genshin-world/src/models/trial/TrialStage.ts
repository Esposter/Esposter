// One stage of the character trials: the dungeon it is fought in, the trial avatar it fights with, the place its trial
// Avatar holds in the event's list and the first-clear reward it pays once
export interface TrialStage {
  dungeonId: number;
  id: number;
  rewardId: number;
  trialAvatarId: number;
  trialAvatarIndexId: number;
}
