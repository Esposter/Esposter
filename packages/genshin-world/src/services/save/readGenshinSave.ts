import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { toAchievementProgressMap } from "#src/services/save/toAchievementProgressMap";
import { toArchiveProgressMap } from "#src/services/save/toArchiveProgressMap";
import { toCharacters } from "#src/services/save/toCharacters";
import { toCommissionDay } from "#src/services/save/toCommissionDay";
import { toInventory } from "#src/services/save/toInventory";
import { toParty } from "#src/services/save/toParty";
import { toShopPurchases } from "#src/services/save/toShopPurchases";
import { toWallet } from "#src/services/save/toWallet";
import { toWorldLevelAdjustment } from "#src/services/save/toWorldLevelAdjustment";

// The world's systems read from a save, the derived ones left to the rules that read them on load. The bag's definitions
// Are read by the item's id, the one thing a save does not hold about an item, and its names from the name-text chunks
export const readGenshinSave = (
  {
    achievements,
    adventureExp,
    archive,
    characters,
    clearedCamps,
    commissionDay,
    companionshipExp,
    crafting,
    homePlacements,
    inventory,
    offerings,
    openedChests,
    party,
    puzzles,
    quests,
    reputation,
    shopPurchases,
    statues,
    travelerName,
    unlockedLandmarks,
    wallet,
    wishHistory,
    wishPity,
    worldLevelAdjustment,
  }: GenshinSave,
  nameText: Readonly<Record<string, string>>,
  weaponDataMap: ReadonlyMap<number, WeaponData>,
  materialDataMap: ReadonlyMap<number, MaterialData>,
): GenshinSaveState => {
  const companionshipExpMap = new Map(
    Object.entries(companionshipExp).map(([characterId, exp]) => [Number(characterId), exp]),
  );
  return {
    achievementProgressMap: toAchievementProgressMap(achievements),
    adventureExp,
    archiveKillsMap: new Map(Object.entries(archive.kills).map(([entryId, count]) => [Number(entryId), count])),
    archiveProgressMap: toArchiveProgressMap(archive.progress),
    characterCopyCountMap: new Map(characters.map(({ copyCount, id }) => [id, copyCount])),
    characters: toCharacters(characters, companionshipExpMap),
    clearedCamps,
    commissionDay: toCommissionDay(commissionDay),
    companionshipExpMap,
    craftedCountMap: new Map(
      Object.entries(crafting.craftedCounts).map(([recipeId, count]) => [Number(recipeId), count]),
    ),
    craftingProgress: { learnedRecipeIds: crafting.learnedRecipeIds },
    foundOculusIds: new Set(statues.foundOculusIds),
    frostbearingTreeProgress: offerings.frostbearingTree,
    homePlacements,
    inventory: toInventory(inventory, nameText, weaponDataMap, materialDataMap),
    openedChestIds: new Set(openedChests),
    party: toParty(party),
    quests: new Map(Object.entries(quests)),
    regionStatueProgressMap: new Map(Object.entries(statues.regions)),
    reputation,
    settledSeelieIds: new Set(puzzles.settledSeelieIds),
    shopPurchases: toShopPurchases(shopPurchases),
    solvedPuzzleIds: new Set(puzzles.solvedPuzzleIds),
    travelerName,
    unlockedLandmarkIds: new Set(unlockedLandmarks),
    wallet: toWallet(wallet),
    wishHistory,
    wishPityMap: wishPity,
    worldLevelAdjustment: toWorldLevelAdjustment(worldLevelAdjustment),
  };
};
