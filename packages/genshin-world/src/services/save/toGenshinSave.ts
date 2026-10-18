import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toArchiveProgressSave } from "#src/services/save/toArchiveProgressSave";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { toCommissionDaySave } from "#src/services/save/toCommissionDaySave";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { toWorldLevelAdjustmentSave } from "#src/services/save/toWorldLevelAdjustmentSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({
  achievementProgressMap,
  adventureExp,
  archiveKillsMap,
  archiveProgressMap,
  characterCopyCountMap,
  characters,
  commissionDay,
  companionshipExpMap,
  craftedCountMap,
  craftingProgress,
  foundOculusIds,
  frostbearingTreeProgress,
  inventory,
  openedChestIds,
  quests,
  regionStatueProgressMap,
  reputation,
  settledSeelieIds,
  solvedPuzzleIds,
  travelerName,
  unlockedLandmarkIds,
  wallet,
  wishPityMap,
  worldLevelAdjustment,
}: GenshinSaveState): GenshinSave => ({
  achievements: toAchievementProgressSave(achievementProgressMap),
  adventureExp,
  archive: { kills: Object.fromEntries(archiveKillsMap), progress: toArchiveProgressSave(archiveProgressMap) },
  characters: toCharacterSaves(characters, characterCopyCountMap),
  commissionDay: toCommissionDaySave(commissionDay),
  companionshipExp: Object.fromEntries([
    ...companionshipExpMap,
    ...characters.map(({ friendshipExp, id }): [number, number] => [id, friendshipExp]),
  ]),
  crafting: { craftedCounts: Object.fromEntries(craftedCountMap), learnedRecipeIds: craftingProgress.learnedRecipeIds },
  inventory: toInventorySave(inventory),
  offerings: { frostbearingTree: frostbearingTreeProgress },
  openedChests: [...openedChestIds],
  puzzles: { settledSeelieIds: [...settledSeelieIds], solvedPuzzleIds: [...solvedPuzzleIds] },
  quests: Object.fromEntries(quests),
  reputation,
  statues: { foundOculusIds: [...foundOculusIds], regions: Object.fromEntries(regionStatueProgressMap) },
  travelerName,
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
  wishPity: wishPityMap,
  worldLevelAdjustment: toWorldLevelAdjustmentSave(worldLevelAdjustment),
});
