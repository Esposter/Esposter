import type { GcgChallengerGame } from "#src/models/gcg/GcgChallengerGame";
import type { Resident } from "#src/models/world/Resident";

import { listGcgOpenGameIds } from "#src/services/gcg/listGcgOpenGameIds";

// Whether a resident's duel is open to the player. A resident with week games is a challenger, whose duels the Player Level
// Opens from the week board's levels, and is closed until those levels are read; any other resident's duel is opened by its
// Talk's quest condition alone, so it has no Player Level gate
export const checkIsGcgResidentDuelOpen = (
  { duelGameId, id, weekGames }: Resident,
  challengerGames: Readonly<Record<string, readonly GcgChallengerGame[]>> | undefined,
  playerLevel: number,
): boolean => {
  if (weekGames === undefined) return true;
  if (challengerGames === undefined || duelGameId === undefined) return false;
  return listGcgOpenGameIds(challengerGames[id] ?? [], playerLevel).includes(duelGameId);
};
