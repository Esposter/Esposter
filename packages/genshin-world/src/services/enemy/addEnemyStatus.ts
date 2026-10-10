import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";

// Gives an enemy a status, restarting its seconds if it already carries one of the same id, as the game refreshes it,
// While a status that strikes on its own schedule keeps the schedule it holds. A status that stacks adds its stacks to
// The one it holds, up to its maximum, rather than restarting it
export const addEnemyStatus = (enemy: Enemy, status: EnemyStatus): void => {
  const earlier = enemy.statuses.find(({ id }) => id === status.id);
  if (!earlier) enemy.statuses.push(status);
  else if (status.stacks === undefined) {
    const { nextTickSeconds } = earlier;
    Object.assign(earlier, status);
    if (nextTickSeconds !== undefined) earlier.nextTickSeconds = nextTickSeconds;
  } else earlier.stacks = Math.min(status.maxStacks ?? Infinity, (earlier.stacks ?? 0) + status.stacks);
};
