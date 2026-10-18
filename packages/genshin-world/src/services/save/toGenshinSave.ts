import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { toCommissionDaySave } from "#src/services/save/toCommissionDaySave";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toPartySave } from "#src/services/save/toPartySave";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { toWorldLevelAdjustmentSave } from "#src/services/save/toWorldLevelAdjustmentSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({
  achievementProgressMap,
  adventureExp,
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
  party,
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
  party: toPartySave(party),
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
