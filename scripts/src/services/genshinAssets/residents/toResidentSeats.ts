import type { ResidentDuel } from "#src/models/genshinAssets/residents/ResidentDuel";
import type { Resident, ResidentWeekGame } from "genshin-world";

import { RESIDENT_DUEL_GAME_ID_MAP } from "#src/services/genshinAssets/residents/constants";

// The seat a resident is written with: the world-level duel its row names, else the duel the residents' constants hold for
// It, which are the week-table duels with no world-level row, and the week games its week row offers
export const toResidentSeats = (
  residentId: string,
  duelMap: ReadonlyMap<string, ResidentDuel>,
  weekGamesMap: ReadonlyMap<string, ResidentWeekGame[]>,
): Pick<Resident, "duelGameId" | "duelTalkId" | "weekGames"> => {
  const duel = duelMap.get(residentId);
  return {
    duelGameId: duel?.duelGameId ?? RESIDENT_DUEL_GAME_ID_MAP.get(residentId),
    duelTalkId: duel?.duelTalkId,
    weekGames: weekGamesMap.get(residentId),
  };
};
