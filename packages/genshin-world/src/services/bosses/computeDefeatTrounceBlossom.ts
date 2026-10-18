import type { TrounceBlossom } from "#src/models/bosses/TrounceBlossom";
import type { GroundPoint } from "genshin-engine";

import { EnemyType } from "#src/models/enemy/EnemyType";

// The Trounce Blossom a defeated boss leaves where it fell, its place copied since the enemy's step writes its position
// In place. A common or elite enemy leaves none
export const computeDefeatTrounceBlossom = (enemyType: EnemyType, position: GroundPoint): TrounceBlossom | undefined =>
  enemyType === EnemyType.Boss ? { place: { x: position.x, z: position.z } } : undefined;
