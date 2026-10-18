import type { ChestReward } from "#src/models/chest/ChestReward";

import { ChestKind } from "#src/models/chest/ChestKind";

// The wallet's share of each tier's rewards, from the wiki's chest reward table, and each tier's Adventure EXP from the
// Adventure EXP page's chest table, which gives 30 for each of these five. Provisional: the ranges are the table's
// For the areas it names as the default, and the Primogems of Dragonspine, the Stormbearer Mountains and the high
// Zone-level areas differ. The Sigil ranges are the table's for each kind. A Luxurious chest gives no Mora, since only the
// Named Luxurious chests carry Mora of their own, and a Remarkable chest's Primogems are its outside-Tsurumi 5, with no
// Sigils, the table giving it no row, and its blueprints left out until a page names each one. A kind with no entry,
// Buried and Sealed, is unrewarded
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
  [ChestKind.Luxurious]: {
    adventureExp: 30,
    mora: { max: 0, min: 0 },
    primogem: { max: 10, min: 10 },
    sigil: { max: 10, min: 4 },
  },
  [ChestKind.Precious]: {
    adventureExp: 30,
    mora: { max: 1433, min: 1433 },
    primogem: { max: 10, min: 5 },
    sigil: { max: 10, min: 3 },
  },
  [ChestKind.Remarkable]: {
    adventureExp: 30,
    mora: { max: 0, min: 0 },
    primogem: { max: 5, min: 5 },
    sigil: { max: 0, min: 0 },
  },
};
