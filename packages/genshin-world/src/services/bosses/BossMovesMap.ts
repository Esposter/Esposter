import type { BossMove } from "#src/models/bosses/BossMove";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { ANEMO_HYPOSTASIS_MOVES } from "#src/services/bosses/anemoHypostasis";

// The moves each boss makes in turn, by its kind. A kind with no entry is a common enemy that makes its basic attack
export const BossMovesMap: Partial<Record<EnemyKindId, readonly BossMove[]>> = {
  [EnemyKindId.AnemoHypostasis]: ANEMO_HYPOSTASIS_MOVES,
};
