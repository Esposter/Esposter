import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toWalletSave } from "#src/services/save/toWalletSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({
  achievementProgressMap,
  adventureExp,
  companionshipExpMap,
  inventory,
  quests,
  reputation,
  unlockedLandmarkIds,
  wallet,
  wishPityMap,
}: GenshinSaveState): GenshinSave => ({
  achievements: toAchievementProgressSave(achievementProgressMap),
  adventureExp,
  companionshipExp: Object.fromEntries(companionshipExpMap),
  inventory: toInventorySave(inventory),
  quests: Object.fromEntries(quests),
  reputation,
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
  wishPity: wishPityMap,
});
