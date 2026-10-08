import type { EnemyDropTable } from "#src/models/enemy/EnemyDropTable";

import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";

// Each drop family's base Mora and materials, by the game's item ids, as the wiki tabulates them
export const EnemyDropFamilyDropTableMap: Record<EnemyDropFamily, EnemyDropTable> = {
  [EnemyDropFamily.Hilichurls]: {
    materials: [
      // Damaged, Stained and Ominous Masks
      { expectedCount: 0.4202, itemId: 112_005, tier: 0 },
      { expectedCount: 0.112, itemId: 112_006, tier: 1 },
      { expectedCount: 0.028, itemId: 112_007, tier: 2 },
    ],
    mora: 32,
  },
};
