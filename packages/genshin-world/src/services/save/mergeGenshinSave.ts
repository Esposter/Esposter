import type { AchievementProgressSave } from "#src/models/achievement/AchievementProgressSave";
import type { QuestProgressSave } from "#src/models/quest/QuestProgressSave";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GenshinSave } from "#src/models/save/GenshinSave";

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
// A count of doings only grows
const mergeQuestProgress = (
  account: QuestProgressSave[string],
  guest: QuestProgressSave[string],
): QuestProgressSave[string] => {
  if (guest.stepIndex !== account.stepIndex) return guest.stepIndex > account.stepIndex ? guest : account;
  return {
    objectiveCounts: account.objectiveCounts.map((count, index) => Math.max(count, guest.objectiveCounts[index] ?? 0)),
    stepIndex: account.stepIndex,
  };
};
// Mondstadt's Reputation is the further of the two, by its level and then by the EXP toward the next
const checkIsFurtherReputation = (reputation: ReputationProgress, than: ReputationProgress): boolean =>
  reputation.level === than.level ? reputation.exp > than.exp : reputation.level > than.level;

// A guest's save merged into the account's one when both exist. The landmarks and achievements are grow-only, so they
// Union, and an achievement keeps the larger count. A quest keeps the further of the two steps, since a step is never
// Undone, and on the same step each objective's count takes the larger. Each character's Companionship EXP and the
// Adventure EXP keep the larger, as a counter only grows. Each kind of
// Wish keeps the counters of the copy that has made more wishes of it, whole, so its pity is one copy's and never mixed.
// The Reputation keeps the further. The bag and the wallet are the account's copy, except that a Primogem refill count
// From the same game day takes the larger, as a count of refills within a day only grows
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
    companionshipExp,
    inventory: account.inventory,
    quests,
    reputation: checkIsFurtherReputation(guest.reputation, account.reputation) ? guest.reputation : account.reputation,
    unlockedLandmarks: [...new Set([...account.unlockedLandmarks, ...guest.unlockedLandmarks])],
    wallet: {
      ...account.wallet,
      primogemResinRefillCount: isSameRefillDay
        ? Math.max(account.wallet.primogemResinRefillCount, guest.wallet.primogemResinRefillCount)
        : account.wallet.primogemResinRefillCount,
    },
    wishPity,
  };
};
