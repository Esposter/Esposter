import type { WeeklyBossTrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import type { GroundPoint } from "genshin-engine";

import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { WEEKLY_BOSS_ENEMY_KIND_IDS } from "#src/services/bosses/constants";

// The Trounce Blossom a defeated weekly boss leaves where it fell, its place copied as a normal boss's is, unclaimed. It
// Pays no drop of its own, since a weekly boss's claim draws its rewards by World Level. A kind that is no weekly boss
// Leaves none
export const computeDefeatWeeklyBossTrounceBlossom = (
  enemyKindId: EnemyKindId,
  position: GroundPoint,
): WeeklyBossTrounceBlossom | undefined =>
  WEEKLY_BOSS_ENEMY_KIND_IDS.includes(enemyKindId)
    ? { claimedAts: [], kind: BlossomKind.WeeklyBoss, place: { x: position.x, z: position.z } }
    : undefined;
