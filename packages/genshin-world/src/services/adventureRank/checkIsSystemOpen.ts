import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKindOpenQuestMap } from "#src/services/adventureRank/ScreenKindOpenQuestMap";
import { ScreenKindOpenRankMap } from "#src/services/adventureRank/ScreenKindOpenRankMap";

// Whether a system is open at the Adventure Rank the player holds and with the main quests they have finished.
// A system the maps leave ungated is open from the start
export const checkIsSystemOpen = (
  screenKind: TitledScreenKind,
  adventureRank: number,
  finishedMainQuestIds: ReadonlySet<number>,
): boolean => {
  const openRank = ScreenKindOpenRankMap[screenKind];
  const openQuestIds = ScreenKindOpenQuestMap[screenKind];
  return (
    (openRank === undefined || adventureRank >= openRank) &&
    (openQuestIds === undefined || openQuestIds.every((questId) => finishedMainQuestIds.has(questId)))
  );
};
