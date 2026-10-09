import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toWalletSave } from "#src/services/save/toWalletSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({ quests, unlockedLandmarkIds, wallet }: GenshinSaveState): GenshinSave => ({
  quests: Object.fromEntries(quests),
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
});
