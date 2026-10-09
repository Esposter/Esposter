import type { GenshinSave } from "#src/models/save/GenshinSave";

import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { mergeGenshinSave } from "#src/services/save/mergeGenshinSave";
import { describe, expect, it } from "vitest";

const LANDMARK_ID = "1";
const OTHER_LANDMARK_ID = "2";
const QUEST_ID = "3";
const REFILL_DAY = "2026-10-09";
const ACCOUNT_REFILL_COUNT = 2;
const GUEST_REFILL_COUNT = 4;

describe(mergeGenshinSave, () => {
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
      wallet: { ...EMPTY_GENSHIN_SAVE.wallet, primogemResinRefillCount: GUEST_REFILL_COUNT },
    };

    expect(mergeGenshinSave(account, guest).wallet.primogemResinRefillCount).toBe(ACCOUNT_REFILL_COUNT);
  });
});
