import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { mergeGenshinSave } from "#src/services/save/mergeGenshinSave";
import { INITIAL_WISH_PITY } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(mergeGenshinSave, () => {
  const LANDMARK_ID = "1";
  const OTHER_LANDMARK_ID = "2";
  const QUEST_ID = "3";
  const REFILL_DAY = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate().toString();
  const OTHER_REFILL_DAY = Temporal.PlainDate.from(REFILL_DAY).add({ days: 1 }).toString();
  const ACCOUNT_REFILL_COUNT = 2;
  const GUEST_REFILL_COUNT = 4;
  const ACHIEVEMENT_ID = "5";
  const EARLIER_FINISHED_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const LATER_FINISHED_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 2 }).toString();
  const ACCOUNT_COUNT = 1;
  const GUEST_COUNT = 3;
  const ACCOUNT_EXP = 100;
  const GUEST_EXP = 200;
  const CHARACTER_ID = "6";
  const ACCOUNT_LEVEL = 1;
  const GUEST_LEVEL = 2;
  const WISH_KIND = BannerKind.Standard;
  const FATE_POINTS = 1;

  test("unions the landmarks", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [LANDMARK_ID] };
    const guest = { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [OTHER_LANDMARK_ID, LANDMARK_ID] };

    expect(mergeGenshinSave(account, guest).unlockedLandmarks).toStrictEqual([LANDMARK_ID, OTHER_LANDMARK_ID]);
  });

  test("keeps the further step of a quest", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [1], stepIndex: 2 } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [0], stepIndex: 1 } } };

    expect(mergeGenshinSave(account, guest).quests).toStrictEqual({
      [QUEST_ID]: { objectiveCounts: [1], stepIndex: 2 },
    });
  });

  test("keeps the account's wallet, taking the larger refill count of the same day", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      wallet: {
        ...EMPTY_GENSHIN_SAVE.wallet,
        primogemResinRefillCount: ACCOUNT_REFILL_COUNT,
        primogemResinRefillDay: REFILL_DAY,
      },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      wallet: {
        ...EMPTY_GENSHIN_SAVE.wallet,
        primogemResinRefillCount: GUEST_REFILL_COUNT,
        primogemResinRefillDay: REFILL_DAY,
      },
    };

    expect(mergeGenshinSave(account, guest).wallet.primogemResinRefillCount).toBe(GUEST_REFILL_COUNT);
  });

  test("keeps the account's refill count on another day", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      wallet: {
        ...EMPTY_GENSHIN_SAVE.wallet,
        primogemResinRefillCount: ACCOUNT_REFILL_COUNT,
        primogemResinRefillDay: REFILL_DAY,
      },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      wallet: {
        ...EMPTY_GENSHIN_SAVE.wallet,
        primogemResinRefillCount: GUEST_REFILL_COUNT,
        primogemResinRefillDay: OTHER_REFILL_DAY,
      },
    };

    expect(mergeGenshinSave(account, guest).wallet.primogemResinRefillCount).toBe(ACCOUNT_REFILL_COUNT);
  });

  test("keeps the larger count of an achievement and the earlier moment it was finished", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      achievements: { [ACHIEVEMENT_ID]: { count: ACCOUNT_COUNT, finishedAt: LATER_FINISHED_AT } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      achievements: { [ACHIEVEMENT_ID]: { count: GUEST_COUNT, finishedAt: EARLIER_FINISHED_AT } },
    };

    expect(mergeGenshinSave(account, guest).achievements).toStrictEqual({
      [ACHIEVEMENT_ID]: { count: GUEST_COUNT, finishedAt: EARLIER_FINISHED_AT },
    });
  });

  test("keeps an achievement only one copy holds", () => {
    expect.hasAssertions();
    const guest = { ...EMPTY_GENSHIN_SAVE, achievements: { [ACHIEVEMENT_ID]: { count: GUEST_COUNT } } };

    expect(mergeGenshinSave(EMPTY_GENSHIN_SAVE, guest).achievements).toStrictEqual({
      [ACHIEVEMENT_ID]: { count: GUEST_COUNT },
    });
  });

  test("keeps the larger Adventure EXP and each character's larger Companionship EXP", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      adventureExp: ACCOUNT_EXP,
      companionshipExp: { [CHARACTER_ID]: ACCOUNT_EXP },
    };
    const guest = { ...EMPTY_GENSHIN_SAVE, adventureExp: GUEST_EXP, companionshipExp: { [CHARACTER_ID]: GUEST_EXP } };

    const merged = mergeGenshinSave(account, guest);

    expect(merged.adventureExp).toBe(GUEST_EXP);
    expect(merged.companionshipExp).toStrictEqual({ [CHARACTER_ID]: GUEST_EXP });
  });

  test("keeps the further Reputation by its level, then its EXP", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, reputation: { exp: GUEST_EXP, level: ACCOUNT_LEVEL } };
    const guest = { ...EMPTY_GENSHIN_SAVE, reputation: { exp: ACCOUNT_EXP, level: GUEST_LEVEL } };

    expect(mergeGenshinSave(account, guest).reputation).toStrictEqual({ exp: ACCOUNT_EXP, level: GUEST_LEVEL });
  });

  test("keeps the counters of the kind of wish the copy that has made more wishes of it holds, whole", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      wishPity: { ...EMPTY_GENSHIN_SAVE.wishPity, [WISH_KIND]: { ...INITIAL_WISH_PITY, wishCount: ACCOUNT_COUNT } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      wishPity: {
        ...EMPTY_GENSHIN_SAVE.wishPity,
        [WISH_KIND]: { ...INITIAL_WISH_PITY, fatePoints: FATE_POINTS, wishCount: GUEST_COUNT },
      },
    };

    expect(mergeGenshinSave(account, guest).wishPity[WISH_KIND]).toStrictEqual({
      ...INITIAL_WISH_PITY,
      fatePoints: FATE_POINTS,
      wishCount: GUEST_COUNT,
    });
  });
});
