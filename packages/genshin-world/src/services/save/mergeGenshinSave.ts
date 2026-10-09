import type { GenshinSave } from "#src/models/save/GenshinSave";

// A guest's save merged into the account's one when both exist. The landmarks are grow-only, so they union. A quest
// Keeps the further of the two along, since a step is never undone. The wallet is the account's copy, except that a
// Primogem refill count from the same game day takes the larger, as a count of refills within a day only grows
export const mergeGenshinSave = (account: GenshinSave, guest: GenshinSave): GenshinSave => {
  const quests = { ...account.quests };
  for (const [questId, guestProgress] of Object.entries(guest.quests)) {
    const accountProgress = quests[questId];
    if (!accountProgress || guestProgress.stepIndex > accountProgress.stepIndex) quests[questId] = guestProgress;
  }
  const isSameRefillDay = account.wallet.primogemResinRefillDay === guest.wallet.primogemResinRefillDay;
  return {
    quests,
    unlockedLandmarks: [...new Set([...account.unlockedLandmarks, ...guest.unlockedLandmarks])],
    wallet: {
      ...account.wallet,
      primogemResinRefillCount: isSameRefillDay
        ? Math.max(account.wallet.primogemResinRefillCount, guest.wallet.primogemResinRefillCount)
        : account.wallet.primogemResinRefillCount,
    },
  };
};
