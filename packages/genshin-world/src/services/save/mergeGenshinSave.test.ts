import type { CharacterSave } from "#src/models/character/CharacterSave";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { mergeGenshinSave } from "#src/services/save/mergeGenshinSave";
import { INITIAL_WISH_PITY } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(mergeGenshinSave, () => {
  const LANDMARK_ID = "1";
  const OTHER_LANDMARK_ID = "2";
  const QUEST_ID = "3";
  const CHEST_ID = "chest-1";
  const OTHER_CHEST_ID = "chest-2";
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
  const CHARACTER_ID = 6;
  const OTHER_CHARACTER_ID = 7;
  const ACCOUNT_CHARACTER_LEVEL = 7;
  const GUEST_CHARACTER_LEVEL = 10;
  const ACCOUNT_CHARACTER_COPY_COUNT = 3;
  const GUEST_CHARACTER_COPY_COUNT = 2;
  const ACCOUNT_CONSTELLATION_COUNT = 4;
  const GUEST_CONSTELLATION_COUNT = 2;
  const RECIPE_ID = 22_007;
  const OTHER_RECIPE_ID = 22_008;
  const ACCOUNT_LEVEL = 1;
  const GUEST_LEVEL = 2;
  const WISH_KIND = BannerKind.Standard;
  const FATE_POINTS = 1;
  const ACCOUNT_TRAVELER_NAME = "a";
  const GUEST_TRAVELER_NAME = "b";
  const EARLIER_DEALT_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const LATER_DEALT_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 2 }).toString();
  // A character as a save holds it, the fields a test reads set by its own overrides
  const characterSave = (overrides: Partial<CharacterSave>): CharacterSave => ({
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    copyCount: 1,
    id: CHARACTER_ID,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
    ...overrides,
  });

  test("unions the landmarks", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [LANDMARK_ID] };
    const guest = { ...EMPTY_GENSHIN_SAVE, unlockedLandmarks: [OTHER_LANDMARK_ID, LANDMARK_ID] };

    expect(mergeGenshinSave(account, guest).unlockedLandmarks).toStrictEqual([LANDMARK_ID, OTHER_LANDMARK_ID]);
  });

  test("keeps the account's opened chests over the guest's", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, openedChests: [CHEST_ID] };
    const guest = { ...EMPTY_GENSHIN_SAVE, openedChests: [OTHER_CHEST_ID] };

    expect(mergeGenshinSave(account, guest).openedChests).toStrictEqual([CHEST_ID]);
  });

  test("keeps the further step of a quest", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [1], stepIndex: 2 } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [0], stepIndex: 1 } } };

    expect(mergeGenshinSave(account, guest).quests).toStrictEqual({
      [QUEST_ID]: { objectiveCounts: [1], stepIndex: 2 },
    });
  });

  test("takes the larger count of each objective of a quest on the same step", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [1, 0], stepIndex: 2 } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [0, 3], stepIndex: 2 } } };

    expect(mergeGenshinSave(account, guest).quests).toStrictEqual({
      [QUEST_ID]: { objectiveCounts: [1, 3], stepIndex: 2 },
    });
  });

  test("keeps an objective of a quest on the same step that only the guest counts", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [], stepIndex: 2 } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, quests: { [QUEST_ID]: { objectiveCounts: [3], stepIndex: 2 } } };

    expect(mergeGenshinSave(account, guest).quests).toStrictEqual({
      [QUEST_ID]: { objectiveCounts: [3], stepIndex: 2 },
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

  test("unions the learned recipes and keeps each recipe's larger crafted count", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      crafting: { craftedCounts: { [RECIPE_ID]: ACCOUNT_COUNT }, learnedRecipeIds: [RECIPE_ID] },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      crafting: {
        craftedCounts: { [OTHER_RECIPE_ID]: ACCOUNT_COUNT, [RECIPE_ID]: GUEST_COUNT },
        learnedRecipeIds: [OTHER_RECIPE_ID],
      },
    };

    expect(mergeGenshinSave(account, guest).crafting).toStrictEqual({
      craftedCounts: { [OTHER_RECIPE_ID]: ACCOUNT_COUNT, [RECIPE_ID]: GUEST_COUNT },
      learnedRecipeIds: [RECIPE_ID, OTHER_RECIPE_ID],
    });
  });

  test("keeps the further Reputation by its level, then its EXP", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, reputation: { exp: GUEST_EXP, level: ACCOUNT_LEVEL } };
    const guest = { ...EMPTY_GENSHIN_SAVE, reputation: { exp: ACCOUNT_EXP, level: GUEST_LEVEL } };

    expect(mergeGenshinSave(account, guest).reputation).toStrictEqual({ exp: ACCOUNT_EXP, level: GUEST_LEVEL });
  });

  test("the copy further on is kept when both saves hold a character", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      characters: [characterSave({ copyCount: ACCOUNT_CHARACTER_COPY_COUNT, level: ACCOUNT_CHARACTER_LEVEL })],
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      characters: [characterSave({ copyCount: GUEST_CHARACTER_COPY_COUNT, level: GUEST_CHARACTER_LEVEL })],
    };

    expect(mergeGenshinSave(account, guest).characters).toStrictEqual([
      characterSave({ copyCount: ACCOUNT_CHARACTER_COPY_COUNT, level: GUEST_CHARACTER_LEVEL }),
    ]);
  });

  test("equal levels are settled by constellations", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      characters: [characterSave({ constellationCount: ACCOUNT_CONSTELLATION_COUNT, level: GUEST_CHARACTER_LEVEL })],
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      characters: [characterSave({ constellationCount: GUEST_CONSTELLATION_COUNT, level: GUEST_CHARACTER_LEVEL })],
    };

    expect(mergeGenshinSave(account, guest).characters).toStrictEqual([
      characterSave({ constellationCount: ACCOUNT_CONSTELLATION_COUNT, level: GUEST_CHARACTER_LEVEL }),
    ]);
  });

  test("a character only the guest holds is kept", () => {
    expect.hasAssertions();
    const guestCharacter = characterSave({ id: OTHER_CHARACTER_ID });
    const account = { ...EMPTY_GENSHIN_SAVE, characters: [] };
    const guest = { ...EMPTY_GENSHIN_SAVE, characters: [guestCharacter] };

    expect(mergeGenshinSave(account, guest).characters).toStrictEqual([guestCharacter]);
  });

  test("keeps the account's Traveler name", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, travelerName: ACCOUNT_TRAVELER_NAME };
    const guest = { ...EMPTY_GENSHIN_SAVE, travelerName: GUEST_TRAVELER_NAME };

    expect(mergeGenshinSave(account, guest).travelerName).toBe(ACCOUNT_TRAVELER_NAME);
  });

  test("keeps the guest's Traveler name while the account has chosen none", () => {
    expect.hasAssertions();
    const guest = { ...EMPTY_GENSHIN_SAVE, travelerName: GUEST_TRAVELER_NAME };

    expect(mergeGenshinSave(EMPTY_GENSHIN_SAVE, guest).travelerName).toBe(GUEST_TRAVELER_NAME);
  });

  test("keeps the account's commissions of the day when the account dealt them later", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      commissionDay: { ...EMPTY_GENSHIN_SAVE.commissionDay, dealtAt: LATER_DEALT_AT },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      commissionDay: { ...EMPTY_GENSHIN_SAVE.commissionDay, dealtAt: EARLIER_DEALT_AT },
    };

    expect(mergeGenshinSave(account, guest).commissionDay).toStrictEqual(account.commissionDay);
  });

  test("keeps the guest's commissions of the day when the guest dealt them later", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      commissionDay: { ...EMPTY_GENSHIN_SAVE.commissionDay, dealtAt: EARLIER_DEALT_AT },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      commissionDay: { ...EMPTY_GENSHIN_SAVE.commissionDay, dealtAt: LATER_DEALT_AT },
    };

    expect(mergeGenshinSave(account, guest).commissionDay).toStrictEqual(guest.commissionDay);
  });

  test("keeps the Frostbearing Tree's progress of the copy that has reached the further level", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, offerings: { frostbearingTree: { heldCount: 4, level: ACCOUNT_LEVEL } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, offerings: { frostbearingTree: { heldCount: 9, level: GUEST_LEVEL } } };

    expect(mergeGenshinSave(account, guest).offerings).toStrictEqual({
      frostbearingTree: { heldCount: 9, level: GUEST_LEVEL },
    });
  });

  test("keeps the Frostbearing Tree's progress that holds more items on the same level", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, offerings: { frostbearingTree: { heldCount: 4, level: ACCOUNT_LEVEL } } };
    const guest = { ...EMPTY_GENSHIN_SAVE, offerings: { frostbearingTree: { heldCount: 9, level: ACCOUNT_LEVEL } } };

    expect(mergeGenshinSave(account, guest).offerings).toStrictEqual({
      frostbearingTree: { heldCount: 9, level: ACCOUNT_LEVEL },
    });
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
