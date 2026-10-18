import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";

// The rank each system the Paimon menu lists opens at, from the wiki's Game System Unlocks table
// A system the map does not list is open from the start
export const ScreenKindOpenRankMap: Readonly<Partial<Record<TitledScreenKind, number>>> = {
  [ScreenKind.BattlePass]: 20,
  [ScreenKind.CoOp]: 16,
  [ScreenKind.Friends]: 2,
};
