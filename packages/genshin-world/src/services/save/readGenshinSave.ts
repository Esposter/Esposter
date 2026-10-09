import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toWallet } from "#src/services/save/toWallet";

// The world's systems read from a save, the derived ones left to the rules that read them on load
export const readGenshinSave = ({ quests, unlockedLandmarks, wallet }: GenshinSave): GenshinSaveState => ({
  quests: new Map(Object.entries(quests)),
  unlockedLandmarkIds: new Set(unlockedLandmarks),
  wallet: toWallet(wallet),
});
