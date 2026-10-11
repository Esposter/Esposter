import type { GroundPoint } from "genshin-engine";

import { ENEMY_CAPSULE_RADIUS, ENEMY_DROP_OFFSET } from "#src/services/enemy/constants";

// Where what a reaction on an enemy leaves drops: out from the enemy's edge at a bearing drawn from the world's random
// Source
export const getEnemyDropPoint = ({ x, z }: GroundPoint, random: () => number): GroundPoint => {
  const bearing = random() * 2 * Math.PI;
  const distance = ENEMY_CAPSULE_RADIUS + ENEMY_DROP_OFFSET;
  return { x: x + distance * Math.sin(bearing), z: z + distance * Math.cos(bearing) };
};
