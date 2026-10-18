import type { AchievementProgressSave } from "#src/models/achievement/AchievementProgressSave";
import type { WorldLevelAdjustmentSave } from "#src/models/adventureRank/WorldLevelAdjustmentSave";
import type { ArchiveSave } from "#src/models/archive/ArchiveSave";
import type { CharacterSave } from "#src/models/character/CharacterSave";
import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";
import type { OfferingProgressSave } from "#src/models/offering/OfferingProgressSave";
import type { QuestProgressSave } from "#src/models/quest/QuestProgressSave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { ShopPurchaseSave } from "#src/models/shop/ShopPurchaseSave";
import type { SpiralAbyssCycleSave, SpiralAbyssSave } from "#src/models/spiralAbyss/SpiralAbyssSave";
import type { StatueProgressSave } from "#src/models/statue/StatueProgressSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { countHeldItems } from "#src/services/offering/countHeldItems";
import { appendWishHistory } from "#src/services/wish/appendWishHistory";
import { BannerKind } from "genshin-interface/save";

// An achievement's progress from both copies: its count of doings takes the larger, and the moment it was first finished
// Is the earlier of the two, since a finished achievement stays finished
const mergeAchievementProgress = (
  account: AchievementProgressSave[string],
  guest: AchievementProgressSave[string],
): AchievementProgressSave[string] => {
  const count = Math.max(account.count, guest.count);
  if (account.finishedAt === undefined && guest.finishedAt === undefined) return { count };
  if (account.finishedAt === undefined) return { count, finishedAt: guest.finishedAt };
  if (guest.finishedAt === undefined) return { count, finishedAt: account.finishedAt };
  const isGuestFirst =
    Temporal.Instant.compare(Temporal.Instant.from(guest.finishedAt), Temporal.Instant.from(account.finishedAt)) < 0;
  return { count, finishedAt: isGuestFirst ? guest.finishedAt : account.finishedAt };
};
// A quest's progress from both copies: the further step, and on the same step each objective's count takes the larger, as
// A count of doings only grows, an objective only one copy counts kept at its count
const mergeQuestProgress = (
  account: QuestProgressSave[string],
  guest: QuestProgressSave[string],
): QuestProgressSave[string] => {
  if (guest.stepIndex !== account.stepIndex) return guest.stepIndex > account.stepIndex ? guest : account;
  return {
    objectiveCounts: Array.from(
      { length: Math.max(account.objectiveCounts.length, guest.objectiveCounts.length) },
      (_value, index) => Math.max(account.objectiveCounts[index] ?? 0, guest.objectiveCounts[index] ?? 0),
    ),
    stepIndex: account.stepIndex,
  };
};
// Whether a progress is further on than another: by its level, and on the same level by its count toward the next one
const checkIsFurtherByLevel = <T extends { level: number }>(
  progress: T,
  than: T,
  getCount: (progress: T) => number,
): boolean => (progress.level === than.level ? getCount(progress) > getCount(than) : progress.level > than.level);
// Mondstadt's Reputation is the further of the two, by its level and then by the EXP toward the next
const checkIsFurtherReputation = (reputation: ReputationProgress, than: ReputationProgress): boolean =>
  checkIsFurtherByLevel(reputation, than, ({ exp }) => exp);
// The Frostbearing Tree's progress is the further of the two, by its level and then by the items held toward the next
const checkIsFurtherOffering = (progress: OfferingProgressSave, than: OfferingProgressSave): boolean =>
  checkIsFurtherByLevel(progress, than, ({ heldCounts }) => countHeldItems(heldCounts));
// The statues' found Oculi are the union of both copies', and each region is the copy further on, as the Frostbearing
// Tree's is, so a region only one copy holds is kept as it is
const mergeStatueProgress = (account: StatueProgressSave, guest: StatueProgressSave): StatueProgressSave => {
  const regions = { ...account.regions };
  for (const [regionId, guestProgress] of Object.entries(guest.regions)) {
    const accountProgress = regions[regionId];
    regions[regionId] =
      accountProgress && !checkIsFurtherByLevel(guestProgress, accountProgress, ({ heldCount }) => heldCount)
        ? accountProgress
        : guestProgress;
  }
  return { foundOculusIds: [...new Set([...account.foundOculusIds, ...guest.foundOculusIds])], regions };
};
// A character is the copy further on by its level and then its constellations, kept whole so its weapon and artifacts stay
// One copy's. A tie on both keeps the account's
const checkIsFurtherCharacter = (character: CharacterSave, than: CharacterSave): boolean =>
  checkIsFurtherByLevel(character, than, ({ constellationCount }) => constellationCount);
// The characters both copies hold merge to the copy further on, with the larger copy count, and a character only the
// Guest holds is kept after the account's
const mergeCharacters = (account: CharacterSave[], guest: CharacterSave[]): CharacterSave[] => {
  const guestCharacterMap = new Map(guest.map((character) => [character.id, character]));
  const accountCharacterIds = new Set(account.map(({ id }) => id));
  return [
    ...account.map((accountCharacter) => {
      const guestCharacter = guestCharacterMap.get(accountCharacter.id);
      if (!guestCharacter) return accountCharacter;
      const further = checkIsFurtherCharacter(guestCharacter, accountCharacter) ? guestCharacter : accountCharacter;
      return { ...further, copyCount: Math.max(accountCharacter.copyCount, guestCharacter.copyCount) };
    }),
    ...guest.filter(({ id }) => !accountCharacterIds.has(id)),
  ];
};
// The Archive's opened entries union by section, and each Living Being's defeats keep the larger, as both only grow
const mergeArchive = (account: ArchiveSave, guest: ArchiveSave): ArchiveSave => {
  const kills = { ...account.kills };
  for (const [livingBeingId, guestCount] of Object.entries(guest.kills))
    kills[livingBeingId] = Math.max(kills[livingBeingId] ?? 0, guestCount);
  return {
    kills,
    progress: Object.fromEntries(
      Object.values(ArchiveSection).map((section) => [
        section,
        [...new Set([...(account.progress[section] ?? []), ...(guest.progress[section] ?? [])])],
      ]),
    ),
  };
};
// Whether a purchase was bought later than another
const checkIsLaterPurchase = (purchase: ShopPurchaseSave, than: ShopPurchaseSave): boolean =>
  Temporal.Instant.compare(
    Temporal.Instant.from(purchase.lastPurchasedAt),
    Temporal.Instant.from(than.lastPurchasedAt),
  ) > 0;
// A good both copies hold a purchase of keeps the copy bought later, as the copy further on, and a good only one copy holds
// Is kept. Each good is listed once, as the save holds it
const mergeShopPurchases = (account: ShopPurchaseSave[], guest: ShopPurchaseSave[]): ShopPurchaseSave[] => {
  const purchaseMap = new Map(account.map((purchase) => [purchase.goodsId, purchase]));
  for (const guestPurchase of guest) {
    const accountPurchase = purchaseMap.get(guestPurchase.goodsId);
    if (!accountPurchase || checkIsLaterPurchase(guestPurchase, accountPurchase))
      purchaseMap.set(guestPurchase.goodsId, guestPurchase);
  }
  return [...purchaseMap.values()];
};
// The World Level adjustment is the one changed later, one never changed being the earliest
const checkIsLaterWorldLevelAdjustment = (
  adjustment: WorldLevelAdjustmentSave,
  than: WorldLevelAdjustmentSave,
): boolean => {
  if (adjustment.changedAt === undefined) return false;
  if (than.changedAt === undefined) return true;
  return (
    Temporal.Instant.compare(Temporal.Instant.from(adjustment.changedAt), Temporal.Instant.from(than.changedAt)) > 0
  );
};
// The day dealt later is the one the player is on, since a day is dealt again at each daily reset
const checkIsLaterCommissionDay = (day: CommissionDaySave, than: CommissionDaySave): boolean =>
  Temporal.Instant.compare(Temporal.Instant.from(day.dealtAt), Temporal.Instant.from(than.dealtAt)) > 0;

// A guest's save merged into the account's one when both exist. The landmarks, the learned recipes and achievements are
// Grow-only, so they union, and an achievement keeps the larger count. The Archive's opened entries union by section,
// And each Living Being's defeat count keeps the larger. Each recipe's crafted count keeps the larger. A quest keeps
// The further of the two steps, since a step is never undone, and on the same step each objective's count takes the
// Larger. Each character's Companionship EXP and the Adventure EXP keep the larger, as a counter only grows. Each kind
// Of wish keeps the counters of the copy that has made more wishes of it, whole, so its pity is one copy's and never
// Mixed. The Reputation and the Frostbearing Tree each keep the further. The bag, the wallet, the party, the opened
// Chests and the realm's placements are the account's copy, except that a Primogem refill count from the same game day
// Takes the larger, as a count of refills within a day only grows. The World Level adjustment is the copy changed
// Later, since the one change of it the player made last is the one they still stand by. The day's commissions are the
// Copy dealt later, the day the player is on. The Traveler's name is the account's, or the guest's while the account
// Has chosen none. The characters both copies hold are the copy further on, and a character only the guest holds is
// Kept. The statues' found Oculi union, and each statue region is the copy further on, as the Frostbearing Tree's is.
// The settled Seelies and the solved puzzles of both copies union, as neither is undone once it has happened. Each good
// Bought in both copies keeps the purchase made later
export const mergeGenshinSave = (account: GenshinSave, guest: GenshinSave): GenshinSave => {
  const achievements = { ...account.achievements };
  for (const [achievementId, guestProgress] of Object.entries(guest.achievements)) {
    const accountProgress = achievements[achievementId];
    achievements[achievementId] = accountProgress
      ? mergeAchievementProgress(accountProgress, guestProgress)
      : guestProgress;
  }
  const companionshipExp = { ...account.companionshipExp };
  for (const [characterId, guestExp] of Object.entries(guest.companionshipExp))
    companionshipExp[characterId] = Math.max(companionshipExp[characterId] ?? 0, guestExp);
  const craftedCounts = { ...account.crafting.craftedCounts };
  for (const [recipeId, guestCount] of Object.entries(guest.crafting.craftedCounts))
    craftedCounts[recipeId] = Math.max(craftedCounts[recipeId] ?? 0, guestCount);
  const wishPity = { ...account.wishPity };
  for (const bannerKind of Object.values(BannerKind))
    if (guest.wishPity[bannerKind].wishCount > account.wishPity[bannerKind].wishCount)
      wishPity[bannerKind] = guest.wishPity[bannerKind];
  const quests = { ...account.quests };
  for (const [questId, guestProgress] of Object.entries(guest.quests)) {
    const accountProgress = quests[questId];
    quests[questId] = accountProgress ? mergeQuestProgress(accountProgress, guestProgress) : guestProgress;
  }
  const isSameRefillDay = account.wallet.primogemResinRefillDay === guest.wallet.primogemResinRefillDay;
  return {
    achievements,
    adventureExp: Math.max(account.adventureExp, guest.adventureExp),
    archive: mergeArchive(account.archive, guest.archive),
    characters: mergeCharacters(account.characters, guest.characters),
    characterTrials: {
      claimedStageIds: [
        ...new Set([...account.characterTrials.claimedStageIds, ...guest.characterTrials.claimedStageIds]),
      ],
    },
    commissionDay: checkIsLaterCommissionDay(guest.commissionDay, account.commissionDay)
      ? guest.commissionDay
      : account.commissionDay,
    companionshipExp,
    crafting: {
      craftedCounts,
      learnedRecipeIds: [...new Set([...account.crafting.learnedRecipeIds, ...guest.crafting.learnedRecipeIds])],
    },
    homePlacements: account.homePlacements,
    inventory: account.inventory,
    offerings: {
      frostbearingTree: checkIsFurtherOffering(guest.offerings.frostbearingTree, account.offerings.frostbearingTree)
        ? guest.offerings.frostbearingTree
        : account.offerings.frostbearingTree,
    },
    openedChests: account.openedChests,
    party: account.party,
    puzzles: {
      settledSeelieIds: [...new Set([...account.puzzles.settledSeelieIds, ...guest.puzzles.settledSeelieIds])],
      solvedPuzzleIds: [...new Set([...account.puzzles.solvedPuzzleIds, ...guest.puzzles.solvedPuzzleIds])],
    },
    quests,
    reputation: checkIsFurtherReputation(guest.reputation, account.reputation) ? guest.reputation : account.reputation,
    shopPurchases: mergeShopPurchases(account.shopPurchases, guest.shopPurchases),
    spiralAbyss: mergeSpiralAbyss(account.spiralAbyss, guest.spiralAbyss),
    statues: mergeStatueProgress(account.statues, guest.statues),
    travelerName: account.travelerName || guest.travelerName,
    unlockedLandmarks: [...new Set([...account.unlockedLandmarks, ...guest.unlockedLandmarks])],
    wallet: {
      ...account.wallet,
      primogemResinRefillCount: isSameRefillDay
        ? Math.max(account.wallet.primogemResinRefillCount, guest.wallet.primogemResinRefillCount)
        : account.wallet.primogemResinRefillCount,
    },
    wishHistory: appendWishHistory(account.wishHistory, guest.wishHistory, Temporal.Now.instant()),
    wishPity,
    worldLevelAdjustment: checkIsLaterWorldLevelAdjustment(guest.worldLevelAdjustment, account.worldLevelAdjustment)
      ? guest.worldLevelAdjustment
      : account.worldLevelAdjustment,
  };
};

// The Abyss's progress is the union of both copies' cycles: a chamber is cleared if either copy cleared it, with the most stars
// Either copy holds, and a reward is claimed if either copy claimed it
const mergeSpiralAbyssCycle = (account: SpiralAbyssCycleSave, guest: SpiralAbyssCycleSave): SpiralAbyssCycleSave => {
  const chambers = { ...guest.chambers };
  for (const [chamberId, { isCleared, stars }] of Object.entries(account.chambers)) {
    const guestChamber: SpiralAbyssCycleSave["chambers"][string] | undefined = chambers[chamberId];
    chambers[chamberId] = guestChamber
      ? { isCleared: isCleared || guestChamber.isCleared, stars: Math.max(stars, guestChamber.stars) }
      : { isCleared, stars };
  }
  return { chambers, claimedRewardIds: [...new Set([...account.claimedRewardIds, ...guest.claimedRewardIds])] };
};

// A cycle only one copy holds is kept as it is
const mergeSpiralAbyss = (account: SpiralAbyssSave, guest: SpiralAbyssSave): SpiralAbyssSave => {
  const merged = { ...guest };
  for (const [cycleKey, accountCycle] of Object.entries(account)) {
    const guestCycle: SpiralAbyssCycleSave | undefined = guest[cycleKey];
    merged[cycleKey] = guestCycle ? mergeSpiralAbyssCycle(accountCycle, guestCycle) : accountCycle;
  }
  return merged;
};
