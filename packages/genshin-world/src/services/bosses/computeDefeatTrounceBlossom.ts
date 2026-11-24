import type { NormalBossTrounceBlossom } from "#src/models/bosses/NormalBossTrounceBlossom";
import type { GroundPoint } from "genshin-engine";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// The Trounce Blossom a defeated boss leaves lies where it fell, copied since the enemy's step writes its position.
// It is unclaimed, and it pays the boss's own drop.
// A common or elite enemy, or a boss with no drop to pay, leaves none.
export const computeDefeatTrounceBlossom = (
  enemyType: EnemyType,
  position: GroundPoint,
  uniqueDropId: number | undefined,
): NormalBossTrounceBlossom | undefined =>
  enemyType === EnemyType.Boss && uniqueDropId !== undefined
    ? { claimedAts: [], kind: BlossomKind.NormalBoss, place: { x: position.x, z: position.z }, uniqueDropId }
    : undefined;
