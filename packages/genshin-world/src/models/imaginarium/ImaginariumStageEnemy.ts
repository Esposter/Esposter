// One enemy a stage fights: the monster its describe entry's codex row names, and its stats at the stage's level as the
// Game computes them from the monster's base properties and its level curves
export interface ImaginariumStageEnemy {
  attack: number;
  defense: number;
  describeId: number;
  health: number;
  monsterId: number;
}
