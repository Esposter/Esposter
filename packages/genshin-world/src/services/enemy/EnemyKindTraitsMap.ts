import type { EnemyKindTraits } from "#src/models/enemy/EnemyKindTraits";

import { Element } from "#src/models/Element";
import { EnemyDropFamily } from "#src/models/enemy/EnemyDropFamily";
import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { PoiseType } from "#src/models/enemy/PoiseType";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";

// What the wiki gives of each kind the world places, its energy drops in falling order with the drop on its defeat last
export const EnemyKindTraitsMap: Record<EnemyKindId, EnemyKindTraits> = {
  [EnemyKindId.AnemoHypostasis]: {
    element: Element.Anemo,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 75 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 50 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 25 },
      { count: 1, energyDropKind: EnergyDropKind.Orb, healthPercent: 0 },
    ],
    poiseType: PoiseType.Boss,
  },
  [EnemyKindId.HilichurlFighter]: {
    enemyDropFamily: EnemyDropFamily.Hilichurls,
    energyDrops: [
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 60 },
      { count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 },
    ],
    poiseType: PoiseType.Minion,
  },
};
