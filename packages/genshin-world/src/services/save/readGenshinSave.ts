import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { toAchievementProgressMap } from "#src/services/save/toAchievementProgressMap";
import { toInventory } from "#src/services/save/toInventory";
import { toWallet } from "#src/services/save/toWallet";
import { toWorldLevelAdjustment } from "#src/services/save/toWorldLevelAdjustment";

// The world's systems read from a save, the derived ones left to the rules that read them on load. The bag's definitions
// Are read by the item's id, the one thing a save does not hold about an item, and its names from the name-text chunks
export const readGenshinSave = (
  {
    achievements,
    adventureExp,
    companionshipExp,
    crafting,
    inventory,
    quests,
    reputation,
    unlockedLandmarks,
    wallet,
    wishPity,
    worldLevelAdjustment,
  }: GenshinSave,
  nameText: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): GenshinSaveState => ({
  achievementProgressMap: toAchievementProgressMap(achievements),
  adventureExp,
  companionshipExpMap: new Map(
    Object.entries(companionshipExp).map(([characterId, exp]) => [Number(characterId), exp]),
  ),
  craftedCountMap: new Map(
    Object.entries(crafting.craftedCounts).map(([recipeId, count]) => [Number(recipeId), count]),
  ),
  craftingProgress: { learnedRecipeIds: crafting.learnedRecipeIds },
  inventory: toInventory(inventory, nameText, weaponDataMap, materialDataMap),
  quests: new Map(Object.entries(quests)),
  reputation,
  unlockedLandmarkIds: new Set(unlockedLandmarks),
  wallet: toWallet(wallet),
  wishPityMap: wishPity,
  worldLevelAdjustment: toWorldLevelAdjustment(worldLevelAdjustment),
});
