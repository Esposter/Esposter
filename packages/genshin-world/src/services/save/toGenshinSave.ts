import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { GenshinSaveState } from "#src/models/save/GenshinSaveState";

import { toAchievementProgressSave } from "#src/services/save/toAchievementProgressSave";
import { toArchiveProgressSave } from "#src/services/save/toArchiveProgressSave";
import { toCharacterSaves } from "#src/services/save/toCharacterSaves";
import { toCharacterTrialSave } from "#src/services/save/toCharacterTrialSave";
import { toCommissionDaySave } from "#src/services/save/toCommissionDaySave";
import { toEncounterPointsSave } from "#src/services/save/toEncounterPointsSave";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toPartySave } from "#src/services/save/toPartySave";
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
  longTermEncounterPoints,
  foundOculusIds,
  frostbearingTreeProgress,
  homePlacements,
  inventory,
  mails,
  namecardItemId,
  openedChestIds,
  party,
  processingJobs,
  quests,
  regionStatueProgressMap,
  reputation,
  reputationBountyClaimedAts,
  reputationBountyHunt,
  settledSeelieIds,
  shopPurchases,
  shownTipIds,
  spiralAbyssProgressMap,
  solvedPuzzleIds,
  travelerBirthday,
  travelerName,
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
  characters: toCharacterSaves(characters, characterCopyCountMap),
  characterTrials: toCharacterTrialSave(characterTrialClaimedStageIds),
  clearedCamps: [...clearedCamps],
  clearedDomains: [...clearedDomainIds],
  commissionDay: toCommissionDaySave(commissionDay),
  encounterPoints: toEncounterPointsSave(encounterPoints),
  longTermEncounterPoints,
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
  enemyRespawns: Object.fromEntries(enemyRespawnMap),
  homePlacements,
  inventory: toInventorySave(inventory),
  mails,
  namecardItemId,
  offerings: { frostbearingTree: frostbearingTreeProgress },
  openedChests: [...openedChestIds],
  party: toPartySave(party),
  puzzles: { settledSeelieIds: [...settledSeelieIds], solvedPuzzleIds: [...solvedPuzzleIds] },
  quests: Object.fromEntries(quests),
  reputation,
  reputationBountyClaimedAts: reputationBountyClaimedAts.map((claimedAt) => claimedAt.toString()),
  ...(reputationBountyHunt && { reputationBountyHunt }),
  shopPurchases: toShopPurchaseSaves(shopPurchases),
  spiralAbyss: toSpiralAbyssSave(spiralAbyssProgressMap),
  statues: { foundOculusIds: [...foundOculusIds], regions: Object.fromEntries(regionStatueProgressMap) },
  tips: { shown: [...shownTipIds] },
  ...(travelerBirthday && { travelerBirthday }),
  travelerName,
  unlockedLandmarks: [...unlockedLandmarkIds],
  wallet: toWalletSave(wallet),
  wishHistory,
  wishPity: wishPityMap,
  worldLevelAdjustment: toWorldLevelAdjustmentSave(worldLevelAdjustment),
});
