import type { NormalBossTrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { GroundPoint } from "genshin-engine";

import { EnemyType } from "#src/models/enemy/EnemyType";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// The Trounce Blossom a defeated boss leaves where it fell, its place copied since the enemy's step writes its position
// In place, unclaimed, and the boss's own drop it pays. A common or elite enemy, or a boss with no drop to pay, leaves none
export const computeDefeatTrounceBlossom = (
  enemyType: EnemyType,
  position: GroundPoint,
  uniqueDropId: number | undefined,
): NormalBossTrounceBlossom | undefined =>
  enemyType === EnemyType.Boss && uniqueDropId !== undefined
    ? { claimedAts: [], kind: BlossomKind.NormalBoss, place: { x: position.x, z: position.z }, uniqueDropId }
    : undefined;
