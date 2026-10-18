import type { BossMove } from "#src/models/bosses/BossMove";
import type { Enemy } from "#src/models/enemy/Enemy";

import { EnemyState } from "#src/models/enemy/EnemyState";

// Starts the named move as the boss's next and readies it by clearing the attack cooldown, so the boss winds it up
// On its next step within attack range rather than at once. A name no move of the boss carries starts nothing, and so
// Does a boss mid-move, whose move is not replaced (PROVISIONAL)
export const startBossMove = (enemy: Enemy, moves: readonly BossMove[], moveName: string): boolean => {
  const moveIndex = moves.findIndex(({ name }) => name === moveName);
  if (moveIndex === -1 || enemy.state !== EnemyState.Chase) return false;
  enemy.moveIndex = moveIndex;
  enemy.attackCooldownSeconds = 0;
  return true;
};
