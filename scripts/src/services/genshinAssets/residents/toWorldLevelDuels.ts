import type { ExcelGcgWorldLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWorldLevelRow";
import type { ResidentDuel } from "#src/models/genshinAssets/residents/ResidentDuel";

// The duel each listed NPC's world-level row seats it at: the game the row duels and the talk the duel is offered from,
// Each NPC keyed by its id as the residents carry it. An NPC with two rows names two duels the residents cannot choose
// Between, so it is left unseated and named in the second list, whether or not it is listed
export const toWorldLevelDuels = (
  rows: ExcelGcgWorldLevelRow[],
  npcIds: readonly number[],
): { duelMap: Map<string, ResidentDuel>; twoRowNpcIds: string[] } => {
  const duelMap = new Map<string, ResidentDuel>();
  const twoRowNpcIds: string[] = [];
  for (const [npcId, npcRows] of Map.groupBy(rows, (row) => String(row.npcId))) {
    const [row] = npcRows;
    if (row === undefined) continue;
    if (npcRows.length > 1) twoRowNpcIds.push(npcId);
    else if (npcIds.includes(row.npcId))
      duelMap.set(npcId, { duelGameId: row.levelId, duelTalkId: String(row.talkId) });
  }
  return { duelMap, twoRowNpcIds };
};
