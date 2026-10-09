import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";

// Gives an enemy a status, restarting its seconds if it already carries one of the same id, as the game refreshes it
export const addEnemyStatus = (enemy: Enemy, status: EnemyStatus): void => {
  const index = enemy.statuses.findIndex(({ id }) => id === status.id);
  if (index === -1) enemy.statuses.push(status);
  else enemy.statuses[index] = status;
};
