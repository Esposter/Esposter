import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { ANEMO_HYPOSTASIS_MOVES } from "#src/services/bosses/anemoHypostasis";
import { PERPETUAL_MECHANICAL_ARRAY_MOVES } from "#src/services/bosses/perpetualMechanicalArray";
import { STORMTERROR_MOVES } from "#src/services/bosses/stormterror";

// The moves each boss makes in turn, by its kind. A kind with no entry is a common enemy that makes its basic attack
export const EnemyKindMovesMap: Partial<Record<EnemyKindId, readonly BossMove[]>> = {
  [EnemyKindId.AnemoHypostasis]: ANEMO_HYPOSTASIS_MOVES,
  [EnemyKindId.PerpetualMechanicalArray]: PERPETUAL_MECHANICAL_ARRAY_MOVES,
  [EnemyKindId.StormterrorDvalin]: STORMTERROR_MOVES,
};
