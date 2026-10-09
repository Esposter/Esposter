import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressMap } from "#src/services/save/toAchievementProgressMap";
import { toInventory } from "#src/services/save/toInventory";
import { toWallet } from "#src/services/save/toWallet";

// The world's systems read from a save, the derived ones left to the rules that read them on load. The bag's definitions
// Are read by the item's id, the one thing a save does not hold about an item
export const readGenshinSave = (
  {
    achievements,
    adventureExp,
    companionshipExp,
    inventory,
    quests,
    reputation,
    unlockedLandmarks,
    wallet,
    wishPity,
  }: GenshinSave,
  getItemDefinition: (itemId: number) => ItemDefinition,
): GenshinSaveState => ({
  achievementProgressMap: toAchievementProgressMap(achievements),
  adventureExp,
  companionshipExpMap: new Map(
    Object.entries(companionshipExp).map(([characterId, exp]) => [Number(characterId), exp]),
  ),
  inventory: toInventory(inventory, getItemDefinition),
  quests: new Map(Object.entries(quests)),
  reputation,
  unlockedLandmarkIds: new Set(unlockedLandmarks),
  wallet: toWallet(wallet),
  wishPityMap: wishPity,
});
