import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toArchiveProgressSave } from "#src/services/save/toArchiveProgressSave";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { toCharacterTrialSave } from "#src/services/save/toCharacterTrialSave";
import { toCommissionDaySave } from "#src/services/save/toCommissionDaySave";
import { toEncounterPointsSave } from "#src/services/save/toEncounterPointsSave";
import { toHomePlantingSave } from "#src/services/save/toHomePlantingSave";
import { toHomeProgressSave } from "#src/services/save/toHomeProgressSave";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toInvestigationDaySave } from "#src/services/save/toInvestigationDaySave";
import { toPartySave } from "#src/services/save/toPartySave";
import { toTrounceBlossomSave } from "#src/services/save/toTrounceBlossomSave";
import { toProcessingJobSaves } from "#src/services/save/toProcessingJobSaves";
import { toShopPurchaseSaves } from "#src/services/save/toShopPurchaseSaves";
import { toSpiralAbyssSave } from "#src/services/save/toSpiralAbyssSave";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { toWorldLevelAdjustmentSave } from "#src/services/save/toWorldLevelAdjustmentSave";

// The save the world's systems are written to, each system's slice beside its model
export const toGenshinSave = ({
  achievementProgressMap,
  adventureExp,
  adventureRankRewardsClaimed,
  archiveKillsMap,
  archiveProgressMap,
  bossDefeatMap,
  cardGameExp,
  cardGameRewardedGameIds,
  characterCopyCountMap,
  characters,
  characterTrialClaimedStageIds,
  clearedCamps,
  clearedDomainIds,
  commissionDay,
  companionshipExpMap,
  cookingProgress,
  craftedCountMap,
  craftingProgress,
  encounterPoints,
  enemyRespawnMap,
  foundOculusIds,
  frostbearingTreeProgress,
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
  openedChestIds,
  party,
  processingJobs,
  quests,
  queuedTipIds,
  regionStatueProgressMap,
  reputation,
  reputationBountyClaimedAts,
  reputationBountyHunt,
  reputationRequestClaimedAts,
  settledSeelieIds,
  shopPurchases,
  shownTipIds,
  solvedPuzzleIds,
  spiralAbyssProgressMap,
  travelerBirthday,
  travelerName,
  trounceBlossoms,
  unlockedLandmarkIds,
  wallet,
  wishHistory,
  wishPityMap,
  worldLevelAdjustment,
}: GenshinSaveState): GenshinSave => ({
  achievements: toAchievementProgressSave(achievementProgressMap),
  adventureExp,
  adventureRankRewardsClaimed,
  archive: { kills: Object.fromEntries(archiveKillsMap), progress: toArchiveProgressSave(archiveProgressMap) },
  cardGameExp,
  cardGameRewardedGameIds,
  characters: toCharacterSaves(characters, characterCopyCountMap),
  characterTrials: toCharacterTrialSave(characterTrialClaimedStageIds),
  clearedCamps: [...clearedCamps],
  clearedDomains: [...clearedDomainIds],
  commissionDay: toCommissionDaySave(commissionDay),
  companionshipExp: Object.fromEntries([
    ...companionshipExpMap,
    ...characters.map(({ friendshipExp, id }): [number, number] => [id, friendshipExp]),
  ]),
  cooking: {
    learnedRecipeIds: cookingProgress.learnedRecipeIds,
    processingJobs: toProcessingJobSaves(processingJobs),
    proficiencies: cookingProgress.proficiencies,
  },
  crafting: { craftedCounts: Object.fromEntries(craftedCountMap), learnedRecipeIds: craftingProgress.learnedRecipeIds },
  encounterPoints: toEncounterPointsSave(encounterPoints),
  ...(bossDefeatMap.size > 0 && { bossDefeats: Object.fromEntries(bossDefeatMap) }),
  enemyRespawns: Object.fromEntries(enemyRespawnMap),
  homePlacements,
  homePlantings: homePlantings.map((planting) => toHomePlantingSave(planting)),
  homeProgress: toHomeProgressSave(homeProgress),
  inventory: toInventorySave(inventory),
  investigationDay: toInvestigationDaySave(investigationDay),
  ...(lastTeleportAt && { lastTeleportAt: lastTeleportAt.toString() }),
  longTermEncounterPoints,
  mails,
  ...(minedOutcrops.length > 0 && {
    minedOutcrops: minedOutcrops.map(({ id, minedAt }) => ({ id, minedAt: minedAt.toString() })),
  }),
  namecardItemId,
  offerings: { frostbearingTree: frostbearingTreeProgress },
  openedChests: [...openedChestIds],
  party: toPartySave(party),
  puzzles: { settledSeelieIds: [...settledSeelieIds], solvedPuzzleIds: [...solvedPuzzleIds] },
  quests: Object.fromEntries(quests),
  reputation,
  reputationBountyClaimedAts: reputationBountyClaimedAts.map((claimedAt) => claimedAt.toString()),
  reputationRequestClaimedAts: reputationRequestClaimedAts.map((claimedAt) => claimedAt.toString()),
  ...(reputationBountyHunt && { reputationBountyHunt }),
  shopPurchases: toShopPurchaseSaves(shopPurchases),
  spiralAbyss: toSpiralAbyssSave(spiralAbyssProgressMap),
  statues: { foundOculusIds: [...foundOculusIds], regions: Object.fromEntries(regionStatueProgressMap) },
  tips: { queued: [...queuedTipIds], shown: [...shownTipIds] },
  ...(travelerBirthday && { travelerBirthday }),
  travelerName,
  ...(trounceBlossoms.size > 0 && {
    trounceBlossoms: Object.fromEntries(
      [...trounceBlossoms].map(([spawnKey, trounceBlossom]) => [spawnKey, toTrounceBlossomSave(trounceBlossom)]),
    ),
  }),
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
  wishHistory,
  wishPity: wishPityMap,
  worldLevelAdjustment: toWorldLevelAdjustmentSave(worldLevelAdjustment),
});
