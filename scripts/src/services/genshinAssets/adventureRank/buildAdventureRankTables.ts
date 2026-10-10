import type { ExcelPlayerLevelLockRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelLockRow";
import type { ExcelPlayerLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelPlayerLevelRow";
import type { ExcelWorldLevelRow } from "#src/models/genshinAssets/adventureRank/ExcelWorldLevelRow";

import { readExcelTable } from "#src/services/genshinAssets/stats/readExcelTable";
import { GameDataset } from "genshin-world";

// The Adventure Rank tables the world reads, from the dump's player level, level lock and world level tables. The lock
// Table's main quest is held as the game's id in a string, or "" where the World Level needs no quest, the way
// The world's quests name theirs. Returns the records the tables publish under
export const buildAdventureRankTables = (): Record<string, unknown> => {
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
  return {
    [`${GameDataset.AdventureRank}/levels`]: levels,
    [`${GameDataset.AdventureRank}/locks`]: locks,
    [`${GameDataset.AdventureRank}/worldLevels`]: worldLevels,
  };
};
