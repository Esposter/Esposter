import type { AchievementProgressSave } from "#src/models/achievement/AchievementProgressSave";
import type { WorldLevelAdjustmentSave } from "#src/models/adventureRank/WorldLevelAdjustmentSave";
import type { ArchiveSave } from "#src/models/archive/ArchiveSave";
import type { CharacterSave } from "#src/models/character/CharacterSave";
import type { CommissionDaySave } from "#src/models/commission/CommissionDaySave";
import type { EncounterPointsSave } from "#src/models/commission/EncounterPointsSave";
import type { LongTermEncounterPointsSave } from "#src/models/commission/LongTermEncounterPointsSave";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { MinedOutcropSave } from "#src/models/gathering/MinedOutcropSave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { SpiralAbyssCycleSave, SpiralAbyssSave } from "#src/models/spiralAbyss/SpiralAbyssSave";
import type { TipSave } from "#src/models/tip/TipSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { checkIsSameHeldMail } from "#src/services/mail/checkIsSameHeldMail";

// Whether an ISO instant is later than another
const checkIsLaterInstant = (instant: string, than: string): boolean =>
  Temporal.Instant.compare(Temporal.Instant.from(instant), Temporal.Instant.from(than)) > 0;
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
  const isGuestFirst = checkIsLaterInstant(account.finishedAt, guest.finishedAt);
  return { count, finishedAt: isGuestFirst ? guest.finishedAt : account.finishedAt };
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
// The World Level adjustment is the one changed later, one never changed being the earliest
const checkIsLaterWorldLevelAdjustment = (
  adjustment: WorldLevelAdjustmentSave,
  than: WorldLevelAdjustmentSave,
): boolean => {
  if (adjustment.changedAt === undefined) return false;
  if (than.changedAt === undefined) return true;
  return checkIsLaterInstant(adjustment.changedAt, than.changedAt);
};
// The day dealt later is the one the player is on, since a day is dealt again at each daily reset
const checkIsLaterCommissionDay = (day: CommissionDaySave, than: CommissionDaySave): boolean =>
  checkIsLaterInstant(day.dealtAt, than.dealtAt);
// The Encounter Points of the later daily reset are the ones the player holds, and on the same reset the larger count is
const mergeEncounterPoints = (account: EncounterPointsSave, guest: EncounterPointsSave): EncounterPointsSave => {
  const order = Temporal.Instant.compare(
    Temporal.Instant.from(account.earnedOn),
    Temporal.Instant.from(guest.earnedOn),
  );
  if (order === 0) return { ...account, halfPoints: Math.max(account.halfPoints, guest.halfPoints) };
  return order > 0 ? account : guest;
};
// The later major version's Long-Term Encounter Points are held, and within one major version the larger count, as the daily
// Points of one day are
const mergeLongTermEncounterPoints = (
  account: LongTermEncounterPointsSave,
  guest: LongTermEncounterPointsSave,
): LongTermEncounterPointsSave => {
  if (account.majorVersion !== guest.majorVersion) return account.majorVersion > guest.majorVersion ? account : guest;
  return { ...account, halfPoints: Math.max(account.halfPoints, guest.halfPoints) };
};

// The camps both copies cleared, each once, since a camp cleared stays cleared
const mergeClearedCamps = (account: ClearedCamp[], guest: ClearedCamp[]): ClearedCamp[] => [
  ...new Map([...account, ...guest].map((camp) => [camp.id, camp])).values(),
];
// A mined outcrop both copies hold is the later mining of the two, since the later one keeps it gone the longer
const mergeMinedOutcrops = (account: MinedOutcropSave[], guest: MinedOutcropSave[]): MinedOutcropSave[] => {
  const minedOutcropMap = new Map<string, MinedOutcropSave>();
  for (const minedOutcrop of [...account, ...guest]) {
    const heldMinedOutcrop = minedOutcropMap.get(minedOutcrop.id);
    if (heldMinedOutcrop === undefined || checkIsLaterInstant(minedOutcrop.minedAt, heldMinedOutcrop.minedAt))
      minedOutcropMap.set(minedOutcrop.id, minedOutcrop);
  }
  return [...minedOutcropMap.values()];
};
// The tips shown in either copy stay shown, and a tip waiting in either copy waits only while neither has shown it
const mergeTips = (account: TipSave, guest: TipSave): TipSave => {
  const shown = new Set([...account.shown, ...guest.shown]);
  return {
    queued: [...new Set([...account.queued, ...guest.queued])].filter((id) => !shown.has(id)),
    shown: [...shown],
  };
};
// A guest's save merged into the account's one when both exist. A record of a settlement that paid into or out of the
// Bag or the wallet is the account's copy, since the merge keeps the account's bag and wallet, and a guest's copy of
// One would claim a payment the account never received or charge one it never made. That covers each mail's claimed
// State (a mail only the guest holds merges unclaimed), the character trial stages claimed, the games rewarded, the
// Domains cleared, the Adventure Rank rewards claimed, the statues' found Oculi and regions, whose Oculi came out of
// The bag, the Reputation bounty and request claims, the Spiral Abyss's rewards claimed, the shop purchases, each
// Processing's queue, the quests' progress, each kind of wish's pity and history, the enemies' respawns, the crafted
// Counts, the cooking proficiencies, the Frostbearing Tree's progress, the investigation day and the puzzles. The bag,
// The party, the opened chests and the realm's placements are the account's copy too, and so is the wallet, but for a
// Primogem refill count from the same game day, which takes the larger, as a count of refills within a day only grows.
// Every other record merges by its own rule. The landmarks, the cleared camps, the learned recipes and the achievements
// Union, and an achievement keeps the larger count and the earlier moment it was finished. The Archive's opened entries
// Union by section, and each Living Being's defeat count keeps the larger. Each character's Companionship EXP and the
// Adventure EXP keep the larger, as a counter only grows. The Reputation keeps the further. The World Level adjustment
// Is the copy changed later, since the one change of it the player made last is the one they still stand by. The day's
// Commissions are the copy dealt later, the day the player is on. The Traveler's name is the account's, or the guest's
// While the account has chosen none. The characters both copies hold are the copy further on, and a character only the
// Guest holds is kept. The learned dishes union.
export const mergeGenshinSave = (account: GenshinSave, guest: GenshinSave): GenshinSave => {
  const minedOutcrops = mergeMinedOutcrops(account.minedOutcrops ?? [], guest.minedOutcrops ?? []);
  const reputationBountyHunt = account.reputationBountyHunt ?? guest.reputationBountyHunt;
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
  // A mail is kept once per delivery, and a read or pinned mail stays so whichever save it was read or pinned in
  const mails = account.mails.map((accountMail) => {
    const guestMail = guest.mails.find((mail) => checkIsSameHeldMail(mail, accountMail));
    return guestMail
      ? {
          ...accountMail,
          isPinned: accountMail.isPinned || guestMail.isPinned,
          isRead: accountMail.isRead || guestMail.isRead,
        }
      : accountMail;
  });
  mails.push(
    ...guest.mails
      .filter((guestMail) => !account.mails.some((mail) => checkIsSameHeldMail(mail, guestMail)))
      // oxlint-disable-next-line oxc/no-map-spread -- each mail is a new object, never a guest's held mail mutated in place
      .map((guestMail) => ({ ...guestMail, isClaimed: false })),
  );
  const isSameRefillDay = account.wallet.primogemResinRefillDay === guest.wallet.primogemResinRefillDay;
  return {
    achievements,
    adventureExp: Math.max(account.adventureExp, guest.adventureExp),
    adventureRankRewardsClaimed: account.adventureRankRewardsClaimed,
    archive: mergeArchive(account.archive, guest.archive),
    cardGameExp: Math.max(account.cardGameExp, guest.cardGameExp),
    cardGameRewardedGameIds: account.cardGameRewardedGameIds,
    characters: mergeCharacters(account.characters, guest.characters),
    characterTrials: account.characterTrials,
    clearedCamps: mergeClearedCamps(account.clearedCamps, guest.clearedCamps),
    clearedDomains: account.clearedDomains,
    commissionDay: checkIsLaterCommissionDay(guest.commissionDay, account.commissionDay)
      ? guest.commissionDay
      : account.commissionDay,
    companionshipExp,
    cooking: {
      learnedRecipeIds: [...new Set([...account.cooking.learnedRecipeIds, ...guest.cooking.learnedRecipeIds])],
      processingJobs: account.cooking.processingJobs,
      proficiencies: account.cooking.proficiencies,
    },
    crafting: {
      craftedCounts: account.crafting.craftedCounts,
      learnedRecipeIds: [...new Set([...account.crafting.learnedRecipeIds, ...guest.crafting.learnedRecipeIds])],
    },
    encounterPoints: mergeEncounterPoints(account.encounterPoints, guest.encounterPoints),
    enemyRespawns: account.enemyRespawns,
    homePlacements: account.homePlacements,
    homePlantings: account.homePlantings,
    homeProgress: account.homeProgress,
    inventory: account.inventory,
    investigationDay: account.investigationDay,
    longTermEncounterPoints: mergeLongTermEncounterPoints(
      account.longTermEncounterPoints,
      guest.longTermEncounterPoints,
    ),
    mails,
    offerings: account.offerings,
    openedChests: account.openedChests,
    party: account.party,
    puzzles: account.puzzles,
    ...(minedOutcrops.length > 0 && { minedOutcrops }),
    ...(account.bossDefeats && { bossDefeats: account.bossDefeats }),
    ...(account.lastTeleportAt && { lastTeleportAt: account.lastTeleportAt }),
    ...(account.trounceBlossoms && { trounceBlossoms: account.trounceBlossoms }),
    namecardItemId: account.namecardItemId || guest.namecardItemId,
    quests: account.quests,
    reputation: checkIsFurtherReputation(guest.reputation, account.reputation) ? guest.reputation : account.reputation,
    reputationBountyClaimedAts: account.reputationBountyClaimedAts,
    reputationRequestClaimedAts: account.reputationRequestClaimedAts,
    ...(reputationBountyHunt && { reputationBountyHunt }),
    shopPurchases: account.shopPurchases,
    spiralAbyss: mergeSpiralAbyss(account.spiralAbyss, guest.spiralAbyss),
    statues: account.statues,
    tips: mergeTips(account.tips, guest.tips),
    travelerName: account.travelerName || guest.travelerName,
    unlockedLandmarks: [...new Set([...account.unlockedLandmarks, ...guest.unlockedLandmarks])],
    wallet: {
      ...account.wallet,
      primogemResinRefillCount: isSameRefillDay
        ? Math.max(account.wallet.primogemResinRefillCount, guest.wallet.primogemResinRefillCount)
        : account.wallet.primogemResinRefillCount,
    },
    wishHistory: account.wishHistory,
    wishPity: account.wishPity,
    worldLevelAdjustment: checkIsLaterWorldLevelAdjustment(guest.worldLevelAdjustment, account.worldLevelAdjustment)
      ? guest.worldLevelAdjustment
      : account.worldLevelAdjustment,
  };
};

// The Abyss's progress is the union of both copies' cycles: a chamber is cleared if either copy cleared it, with the most stars
// Either copy holds, and the rewards a cycle claimed are the account's copy
const mergeSpiralAbyssCycle = (account: SpiralAbyssCycleSave, guest: SpiralAbyssCycleSave): SpiralAbyssCycleSave => {
  const chambers = { ...guest.chambers };
  for (const [chamberId, { isCleared, stars }] of Object.entries(account.chambers)) {
    const guestChamber: SpiralAbyssCycleSave["chambers"][string] | undefined = chambers[chamberId];
    chambers[chamberId] = guestChamber
      ? { isCleared: isCleared || guestChamber.isCleared, stars: Math.max(stars, guestChamber.stars) }
      : { isCleared, stars };
  }
  return { chambers, claimedRewardIds: account.claimedRewardIds };
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
