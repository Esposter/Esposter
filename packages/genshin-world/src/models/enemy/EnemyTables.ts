import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { EnemyLevelCurves } from "#src/models/enemy/EnemyLevelCurves";

// The game's enemy tables, read as the world opens: every kind it places by its id, and the level curves each kind's
// Base stats are scaled along
export interface EnemyTables {
  enemyKindMap: ReadonlyMap<EnemyKindId, EnemyKind>;
  enemyLevelCurves: EnemyLevelCurves;
}
