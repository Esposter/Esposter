import type { Enemy } from "#src/models/enemy/Enemy";

// Whether the shield an enemy holds is down, which a hit that takes it down staggers the enemy for
export const checkIsEnemyShieldBroken = (enemy: Enemy): boolean => enemy.shield?.health === 0;
