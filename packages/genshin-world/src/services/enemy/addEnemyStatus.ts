import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";

// Gives an enemy a status, restarting its seconds if it already carries one of the same id, as the game refreshes it. A
// Status that stacks adds its stacks to the one it holds, up to its maximum, rather than restarting it
export const addEnemyStatus = (enemy: Enemy, status: EnemyStatus): void => {
  const earlier = enemy.statuses.find(({ id }) => id === status.id);
  if (!earlier) enemy.statuses.push(status);
  else if (status.stacks === undefined) Object.assign(earlier, status);
  else earlier.stacks = Math.min(status.maxStacks ?? Infinity, (earlier.stacks ?? 0) + status.stacks);
};
