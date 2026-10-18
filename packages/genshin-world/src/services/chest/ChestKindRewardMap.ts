import type { ChestReward } from "#src/models/chest/ChestReward";

import { ChestKind } from "#src/models/chest/ChestKind";

// The wallet's share of each tier's rewards, from the wiki's chest reward table, and each tier's Adventure EXP from the
// Adventure EXP page's chest table, which gives 30 for each of these three. Provisional: the Mora and Primogem ranges are
// The table's for the areas it names as the default, and the Primogems of Dragonspine, the Stormbearer Mountains and the
// High Zone-level areas differ. The Sigil ranges are the table's for each kind. A kind with no entry, Luxurious, whose
// Mora the wiki leaves unstated, and Remarkable for its blueprints, is unrewarded
export const ChestKindRewardMap: Partial<Record<ChestKind, ChestReward>> = {
  [ChestKind.Common]: {
    adventureExp: 30,
    mora: { max: 996, min: 257 },
    primogem: { max: 2, min: 0 },
    sigil: { max: 3, min: 1 },
  },
  [ChestKind.Exquisite]: {
    adventureExp: 30,
    mora: { max: 1367, min: 756 },
    primogem: { max: 5, min: 2 },
    sigil: { max: 4, min: 2 },
  },
  [ChestKind.Precious]: {
    adventureExp: 30,
    mora: { max: 1433, min: 1433 },
    primogem: { max: 10, min: 5 },
    sigil: { max: 10, min: 3 },
  },
};
