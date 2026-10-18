import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { toAchievementProgressMap } from "#src/services/save/toAchievementProgressMap";
import { toArchiveProgressMap } from "#src/services/save/toArchiveProgressMap";
import { toCharacters } from "#src/services/save/toCharacters";
import { toCommissionDay } from "#src/services/save/toCommissionDay";
import { toEncounterPoints } from "#src/services/save/toEncounterPoints";
import { toInventory } from "#src/services/save/toInventory";
import { toParty } from "#src/services/save/toParty";
import { toProcessingJobs } from "#src/services/save/toProcessingJobs";
import { toShopPurchases } from "#src/services/save/toShopPurchases";
import { toSpiralAbyssProgressMap } from "#src/services/save/toSpiralAbyssProgressMap";
import { toWallet } from "#src/services/save/toWallet";
import { toWorldLevelAdjustment } from "#src/services/save/toWorldLevelAdjustment";

// The world's systems read from a save, the derived ones left to the rules that read them on load. The bag's definitions
// Are read by the item's id, the one thing a save does not hold about an item, and its names from the name-text chunks
export const readGenshinSave = (
  {
    achievements,
    adventureExp,
    cardGameExp,
    adventureRankRewardsClaimed,
    archive,
    characters,
    characterTrials,
    clearedCamps,
    clearedDomains,
    commissionDay,
    companionshipExp,
    cooking,
    crafting,
    encounterPoints,
    enemyRespawns,
    longTermEncounterPoints,
    homePlacements,
    inventory,
    mails,
    namecardItemId,
    offerings,
    openedChests,
    party,
    puzzles,
    quests,
    reputation,
    shopPurchases,
    spiralAbyss,
    statues,
    tips,
    travelerBirthday,
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
  reliquaryPieceEntryMap: ReadonlyMap<number, ReliquaryPieceEntry>,
): GenshinSaveState => {
  const companionshipExpMap = new Map(
    Object.entries(companionshipExp).map(([characterId, exp]) => [Number(characterId), exp]),
  );
  return {
    achievementProgressMap: toAchievementProgressMap(achievements),
    adventureExp,
    cardGameExp,
    adventureRankRewardsClaimed,
    archiveKillsMap: new Map(Object.entries(archive.kills).map(([entryId, count]) => [Number(entryId), count])),
    archiveProgressMap: toArchiveProgressMap(archive.progress),
    characterCopyCountMap: new Map(characters.map(({ copyCount, id }) => [id, copyCount])),
    characters: toCharacters(characters, companionshipExpMap),
    characterTrialClaimedStageIds: new Set(characterTrials.claimedStageIds),
    clearedCamps,
    clearedDomainIds: new Set(clearedDomains),
    commissionDay: toCommissionDay(commissionDay),
    companionshipExpMap,
    cookingProgress: { learnedRecipeIds: cooking.learnedRecipeIds, proficiencies: cooking.proficiencies },
    craftedCountMap: new Map(
      Object.entries(crafting.craftedCounts).map(([recipeId, count]) => [Number(recipeId), count]),
    ),
    craftingProgress: { learnedRecipeIds: crafting.learnedRecipeIds },
    encounterPoints: toEncounterPoints(encounterPoints),
    longTermEncounterPoints,
    enemyRespawnMap: new Map(Object.entries(enemyRespawns)),
    foundOculusIds: new Set(statues.foundOculusIds),
    frostbearingTreeProgress: offerings.frostbearingTree,
    homePlacements,
    inventory: toInventory(inventory, nameText, weaponDataMap, materialDataMap, reliquaryPieceEntryMap),
    mails,
    namecardItemId,
    openedChestIds: new Set(openedChests),
    party: toParty(party),
    processingJobs: toProcessingJobs(cooking.processingJobs),
    quests: new Map(Object.entries(quests)),
    regionStatueProgressMap: new Map(Object.entries(statues.regions)),
    reputation,
    settledSeelieIds: new Set(puzzles.settledSeelieIds),
    shopPurchases: toShopPurchases(shopPurchases),
    shownTipIds: new Set(tips.shown),
    spiralAbyssProgressMap: toSpiralAbyssProgressMap(spiralAbyss),
    solvedPuzzleIds: new Set(puzzles.solvedPuzzleIds),
    travelerBirthday,
    travelerName,
    unlockedLandmarkIds: new Set(unlockedLandmarks),
    wallet: toWallet(wallet),
    wishHistory,
    wishPityMap: wishPity,
    worldLevelAdjustment: toWorldLevelAdjustment(worldLevelAdjustment),
  };
};
