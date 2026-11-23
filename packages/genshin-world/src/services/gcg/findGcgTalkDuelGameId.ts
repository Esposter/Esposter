import type { GcgLevels } from "#src/models/gcg/GcgLevels";

import { checkIsGcgCardGameOpen } from "#src/services/gcg/checkIsGcgCardGameOpen";
import { computeGcgPlayerLevel } from "#src/services/gcg/computeGcgPlayerLevel";
import { listGcgOpenGameIds } from "#src/services/gcg/listGcgOpenGameIds";
import { GCG_TUTORIAL_QUEST_ID } from "#src/services/quest/constants";

// The card game's duel a resident offers from their talk, the seat's game, once the Adventure Rank has opened the card
// Game And the Player Level has opened that game. A challenger's games are listed under the NPC whose week row names
// Them, which Is not always the NPC seated at the duel (Marjorie's row is 9701, her seat 1435), so the seat's game is
// Looked for by its Id across every row
export const findGcgTalkDuelGameId = (
  duelGameId: number,
  {
    adventureRank,
    cardGameExp,
    completedMainQuestIds,
    levels: { challengerGames, playerLevelLocks, playerLevels },
  }: { adventureRank: number; cardGameExp: number; completedMainQuestIds: ReadonlySet<string>; levels: GcgLevels },
): number | undefined => {
  if (!checkIsGcgCardGameOpen(adventureRank)) return undefined;
  const playerLevel = computeGcgPlayerLevel(
    cardGameExp,
    playerLevels,
    completedMainQuestIds.has(GCG_TUTORIAL_QUEST_ID),
    playerLevelLocks,
    completedMainQuestIds,
  );
  const challengerGameList = Object.values(challengerGames).flat();
  return listGcgOpenGameIds(challengerGameList, playerLevel).includes(duelGameId) ? duelGameId : undefined;
};
