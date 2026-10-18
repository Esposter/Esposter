import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";

import { EnemyKindTraitsMap } from "#src/services/enemy/EnemyKindTraitsMap";

// Whether a kind id is one the world places by hand, the kinds its traits map writes out
export const isEnemyKindId = (enemyKindId: number): enemyKindId is EnemyKindId => enemyKindId in EnemyKindTraitsMap;
