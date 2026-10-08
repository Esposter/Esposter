import type { EnemyKindTraits } from "#src/models/enemy/EnemyKindTraits";

import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { EnergyDropKind } from "#src/models/enemy/EnergyDropKind";
import { PoiseType } from "#src/models/enemy/PoiseType";

// What the wiki gives of each kind the world places, its energy drops in falling order with the drop on its defeat last
export const EnemyKindTraitsMap: Record<EnemyKindId, EnemyKindTraits> = {
  [EnemyKindId.HilichurlFighter]: {
    enemyDropFamily: EnemyDropFamily.Hilichurls,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
};
