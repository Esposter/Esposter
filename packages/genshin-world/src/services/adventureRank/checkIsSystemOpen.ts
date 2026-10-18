import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKindOpenRankMap } from "#src/services/adventureRank/ScreenKindOpenRankMap";

// Whether a system is open at the Adventure Rank the player holds, a system with no rank in the map being open from the start
export const checkIsSystemOpen = (screenKind: TitledScreenKind, adventureRank: number): boolean => {
  const openRank = ScreenKindOpenRankMap[screenKind];
  return openRank === undefined || adventureRank >= openRank;
};
