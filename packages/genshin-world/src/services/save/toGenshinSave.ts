import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { toWorldLevelAdjustmentSave } from "#src/services/save/toWorldLevelAdjustmentSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({
  achievementProgressMap,
  adventureExp,
  characterCopyCountMap,
  characters,
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
  travelerName,
  unlockedLandmarkIds,
  wallet,
  wishPityMap,
  worldLevelAdjustment,
}: GenshinSaveState): GenshinSave => ({
  achievements: toAchievementProgressSave(achievementProgressMap),
  adventureExp,
  characters: toCharacterSaves(characters, characterCopyCountMap),
  companionshipExp: Object.fromEntries([
    ...companionshipExpMap,
    ...characters.map(({ friendshipExp, id }): [number, number] => [id, friendshipExp]),
  ]),
  crafting: { craftedCounts: Object.fromEntries(craftedCountMap), learnedRecipeIds: craftingProgress.learnedRecipeIds },
  inventory: toInventorySave(inventory),
  offerings: { frostbearingTree: frostbearingTreeProgress },
  openedChests: [...openedChestIds],
  quests: Object.fromEntries(quests),
  reputation,
  statues: { foundOculusIds: [...foundOculusIds], regions: Object.fromEntries(regionStatueProgressMap) },
  travelerName,
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
  wishPity: wishPityMap,
  worldLevelAdjustment: toWorldLevelAdjustmentSave(worldLevelAdjustment),
});
