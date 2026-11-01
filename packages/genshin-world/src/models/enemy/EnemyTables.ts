import type { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { EnemyLevelCurves } from "#src/models/enemy/EnemyLevelCurves";
import type { ReactionPoise } from "#src/models/enemy/ReactionPoise";

// The game's enemy tables, read as the world opens: every kind it places by its id, the level curves each kind's base
// Stats are scaled along, and the poise each transformative reaction deals, by the reaction
export interface EnemyTables {
  enemyKindMap: ReadonlyMap<number, EnemyKind>;
  enemyLevelCurves: EnemyLevelCurves;
  reactionPoiseMap: ReadonlyMap<TransformativeReactionType, ReactionPoise>;
}
