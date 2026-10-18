import type { ChestReward } from "#src/models/chest/ChestReward";

import { ChestKind } from "#src/models/chest/ChestKind";

// The wallet's share of each tier's rewards, from the wiki's chest reward table, and each tier's Adventure EXP from the
// Adventure EXP page's chest table, which gives 30 for each of these three. Provisional: the ranges are the table's
// For the areas it names as the default, and the Primogems of Dragonspine, the Stormbearer Mountains and the high
// Zone-level areas differ. A kind with no entry, Luxurious for its Mora and Remarkable for its blueprints, is
// Unrewarded
export const ChestKindRewardMap: Partial<Record<ChestKind, ChestReward>> = {
  [ChestKind.Common]: { adventureExp: 30, mora: { max: 996, min: 257 }, primogem: { max: 2, min: 0 } },
  [ChestKind.Exquisite]: { adventureExp: 30, mora: { max: 1367, min: 756 }, primogem: { max: 5, min: 2 } },
  [ChestKind.Precious]: { adventureExp: 30, mora: { max: 1433, min: 1433 }, primogem: { max: 10, min: 5 } },
};
