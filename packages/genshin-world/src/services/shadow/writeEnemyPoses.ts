import type { Enemy } from "#src/models/enemy/Enemy";

// Writes each enemy's pose in the order the map holds them, the poses `checkEnemiesMoved` compares against
export const writeEnemyPoses = (
  enemyMap: ReadonlyMap<string, Pick<Enemy, "heading" | "position">>,
  enemyPoses: number[],
): void => {
  enemyPoses.length = 0;
  for (const { heading, position } of enemyMap.values()) enemyPoses.push(position.x, position.z, heading);
};
