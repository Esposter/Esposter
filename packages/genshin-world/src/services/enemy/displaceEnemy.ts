import type { GroundPoint } from "genshin-engine";

import { EnemyType } from "#src/models/enemy/EnemyType";

// Where an enemy stands after a strike pushes it. A boss resists displacement, so a strike that would push it leaves it
// Where it stands, and any other enemy is moved by the push along the ground
export const displaceEnemy = (enemyType: EnemyType, position: GroundPoint, push: GroundPoint): GroundPoint =>
  enemyType === EnemyType.Boss ? position : { x: position.x + push.x, z: position.z + push.z };
