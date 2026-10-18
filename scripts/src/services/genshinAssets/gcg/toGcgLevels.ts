import type { ExcelGcgLevelLockRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelLockRow";
import type { ExcelGcgLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelRow";
import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";
import type { GcgChallengerGame, GcgLevelLock, GcgPlayerLevel } from "genshin-world";

// The Player Levels, each with the total EXP that reaches it, each challenger's duels with the level that opens each, and
// the locks that hold the Player Level until their main quest is done. A level's row gives the EXP that passes it to the
// Next, so a level's total is the EXP of every level below it summed
export const toGcgLevels = (
  levelRows: ExcelGcgLevelRow[],
  weekLevelRows: ExcelGcgWeekLevelRow[],
  levelLockRows: ExcelGcgLevelLockRow[],
): {
  challengerGames: Record<string, GcgChallengerGame[]>;
  playerLevelLocks: GcgLevelLock[];
  playerLevels: GcgPlayerLevel[];
} => {
  const sortedLevelRows = levelRows.toSorted((firstRow, secondRow) => firstRow.level - secondRow.level);
  return {
    challengerGames: Object.fromEntries(
      weekLevelRows
        .filter(({ levelCondList }) => levelCondList.length > 0)
        .map(({ levelCondList, npcId }) => [
          String(npcId),
          levelCondList.map(({ gcgLevel, levelId }) => ({ gameId: levelId, level: gcgLevel })),
        ]),
    ),
    playerLevelLocks: levelLockRows
      .toSorted((firstRow, secondRow) => firstRow.unlockLevel - secondRow.unlockLevel)
      .map(({ unlockLevel, unlockMainQuestId }) => ({ unlockLevel, unlockMainQuestId: String(unlockMainQuestId) })),
    playerLevels: sortedLevelRows.map(({ level }, index) => ({
      exp: sortedLevelRows.slice(0, index).reduce((total, { exp }) => total + (exp ?? 0), 0),
      level,
    })),
  };
};
