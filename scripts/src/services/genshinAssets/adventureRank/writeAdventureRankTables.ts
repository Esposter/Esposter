import type { ExcelPlayerLevelLockRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelLockRow";
import type { ExcelPlayerLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelRow";
import type { ExcelWorldLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelWorldLevelRow";

import { ADVENTURE_RANK_DATA_DIRECTORY } from "#src/services/genshinAssets/adventureRank/constants";
import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

// The Adventure Rank tables the world reads, from the dump's player level, level lock and world level tables. The lock
// Table's main quest is written as the game's id in a string, or "" where the World Level needs no quest, the way
// The world's quests name theirs
export const writeAdventureRankTables = (): void => {
  const levels = readExcelTable<ExcelPlayerLevelRow>("PlayerLevelExcelConfigData")
    .map(({ exp, level }) => ({ exp, level }))
    .toSorted((firstLevel, secondLevel) => firstLevel.level - secondLevel.level);
  const locks = readExcelTable<ExcelPlayerLevelLockRow>("PlayerLevelLockExcelConfigData")
    .map(({ playerLevelUpperLimit, unlockMainQuestId, unlockPlayerLevel, worldLevel }) => ({
      rankCap: playerLevelUpperLimit,
      unlockMainQuestId: unlockMainQuestId ? String(unlockMainQuestId) : "",
      unlockPlayerLevel,
      worldLevel,
    }))
    .toSorted((firstLock, secondLock) => firstLock.worldLevel - secondLock.worldLevel);
  const worldLevels = readExcelTable<ExcelWorldLevelRow>("WorldLevelExcelConfigData")
    .map(({ level, monsterLevel }) => ({ level, monsterLevel }))
    .toSorted((firstWorldLevel, secondWorldLevel) => firstWorldLevel.level - secondWorldLevel.level);
  mkdirSync(ADVENTURE_RANK_DATA_DIRECTORY, { recursive: true });
  writeJsonFile(join(ADVENTURE_RANK_DATA_DIRECTORY, "levels.json"), levels);
  writeJsonFile(join(ADVENTURE_RANK_DATA_DIRECTORY, "locks.json"), locks);
  writeJsonFile(join(ADVENTURE_RANK_DATA_DIRECTORY, "worldLevels.json"), worldLevels);
};
