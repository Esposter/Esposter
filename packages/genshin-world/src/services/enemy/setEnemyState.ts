import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyState } from "#src/models/enemy/EnemyState";

// Moves an enemy into a state, whose clock starts again
export const setEnemyState = (enemy: Enemy, state: EnemyState): void => {
  enemy.state = state;
  enemy.stateSeconds = 0;
};
