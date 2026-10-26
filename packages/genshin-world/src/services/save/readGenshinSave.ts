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
import { toHomePlanting } from "#src/services/save/toHomePlanting";
import { toHomeProgress } from "#src/services/save/toHomeProgress";
import { toInventory } from "#src/services/save/toInventory";
import { toInvestigationDay } from "#src/services/save/toInvestigationDay";
import { toParty } from "#src/services/save/toParty";
import { toProcessingJobs } from "#src/services/save/toProcessingJobs";
import { toShopPurchases } from "#src/services/save/toShopPurchases";
import { toSpiralAbyssProgressMap } from "#src/services/save/toSpiralAbyssProgressMap";
import { toTrounceBlossom } from "#src/services/save/toTrounceBlossom";
import { toWallet } from "#src/services/save/toWallet";
import { toWorldLevelAdjustment } from "#src/services/save/toWorldLevelAdjustment";

// The world's systems read from a save, the derived ones left to the rules that read them on load. The bag's definitions
// Are read by the item's id, the one thing a save does not hold about an item, and its names from the name-text chunks
export const readGenshinSave = (
  {
    achievements,
    adventureExp,
    adventureRankRewardsClaimed,
    archive,
    bossDefeats,
    cardGameExp,
    cardGameRewardedGameIds,
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
    homePlacements,
    homePlantings,
    homeProgress,
    inventory,
    investigationDay,
    lastTeleportAt,
    longTermEncounterPoints,
    mails,
    minedOutcrops,
    namecardItemId,
    offerings,
    openedChests,
    party,
    puzzles,
    quests,
    reputation,
    reputationBountyClaimedAts,
    reputationBountyHunt,
    reputationRequestClaimedAts,
    shopPurchases,
    spiralAbyss,
    statues,
    tips,
    travelerBirthday,
    travelerName,
    trounceBlossoms,
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
    adventureRankRewardsClaimed,
    archiveKillsMap: new Map(Object.entries(archive.kills).map(([entryId, count]) => [Number(entryId), count])),
    archiveProgressMap: toArchiveProgressMap(archive.progress),
    bossDefeatMap: new Map(Object.entries(bossDefeats ?? {})),
    cardGameExp,
    cardGameRewardedGameIds,
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
    enemyRespawnMap: new Map(Object.entries(enemyRespawns)),
    foundOculusIds: new Set(statues.foundOculusIds),
    frostbearingTreeProgress: offerings.frostbearingTree,
    homePlacements,
    homePlantings: homePlantings.map((planting) => toHomePlanting(planting)),
    homeProgress: toHomeProgress(homeProgress),
    inventory: toInventory(inventory, nameText, weaponDataMap, materialDataMap, reliquaryPieceEntryMap),
    investigationDay: toInvestigationDay(investigationDay),
    lastTeleportAt: lastTeleportAt ? Temporal.Instant.from(lastTeleportAt) : undefined,
    longTermEncounterPoints,
    mails,
    minedOutcrops: (minedOutcrops ?? []).map(({ id, minedAt }) => ({ id, minedAt: Temporal.Instant.from(minedAt) })),
    namecardItemId,
    openedChestIds: new Set(openedChests),
    party: toParty(party),
    processingJobs: toProcessingJobs(cooking.processingJobs),
    quests: new Map(Object.entries(quests)),
    queuedTipIds: tips.queued,
    regionStatueProgressMap: new Map(Object.entries(statues.regions)),
    reputation,
    reputationBountyClaimedAts: reputationBountyClaimedAts.map((claimedAt) => Temporal.Instant.from(claimedAt)),
    reputationBountyHunt,
    reputationRequestClaimedAts: reputationRequestClaimedAts.map((claimedAt) => Temporal.Instant.from(claimedAt)),
    settledSeelieIds: new Set(puzzles.settledSeelieIds),
    shopPurchases: toShopPurchases(shopPurchases),
    shownTipIds: new Set(tips.shown),
    solvedPuzzleIds: new Set(puzzles.solvedPuzzleIds),
    spiralAbyssProgressMap: toSpiralAbyssProgressMap(spiralAbyss),
    travelerBirthday,
    travelerName,
    trounceBlossoms: new Map(
      Object.entries(trounceBlossoms ?? {}).map(([spawnKey, trounceBlossom]) => [
        spawnKey,
        toTrounceBlossom(trounceBlossom),
      ]),
    ),
    unlockedLandmarkIds: new Set(unlockedLandmarks),
    wallet: toWallet(wallet),
    wishHistory,
    wishPityMap: wishPity,
    worldLevelAdjustment: toWorldLevelAdjustment(worldLevelAdjustment),
  };
};
