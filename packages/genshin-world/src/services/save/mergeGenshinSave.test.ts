import type { CharacterSave } from "#src/models/character/CharacterSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { mergeGenshinSave } from "#src/services/save/mergeGenshinSave";
import { INITIAL_WISH_PITY } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(mergeGenshinSave, () => {
  const COOKING_DISH_ID = 1;
  const OTHER_COOKING_DISH_ID = 2;
  const PROCESSING_ID = 3;
  const OTHER_PROCESSING_ID = 4;
  const EARLIER_START = Temporal.Instant.fromEpochMilliseconds(0).toString();
  const LATER_START = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const LANDMARK_ID = "1";
  const OTHER_LANDMARK_ID = "2";
  const QUEST_ID = "3";
  const ENTRY_ID = 1;
  const OTHER_ENTRY_ID = 2;
  const LIVING_BEING_ID = "3";
  const CHEST_ID = "chest-1";
  const OTHER_CHEST_ID = "chest-2";
  const OCULUS_ID = "1";
  const CLEARED_CAMP = { id: "made-up-camp-1", position: { x: 1, z: 2 } };
  const OTHER_CLEARED_CAMP = { id: "made-up-camp-2", position: { x: 3, z: 4 } };
  const SHARED_OCULUS_ID = "2";
  const GUEST_OCULUS_ID = "3";
  const REGION_ID = "mondstadt";
  const SEELIE_ID = "seelie-1";
  const OTHER_SEELIE_ID = "seelie-2";
  const PUZZLE_ID = "puzzle-1";
  const TRIAL_STAGE_ID = 51_001;
  const OTHER_TRIAL_STAGE_ID = 51_002;
  const GUEST_TRIAL_STAGE_ID = 51_003;
  // Two goods a shop sells, one of them bought in both copies, the other by one only
  const SHOP_GOODS_ID = 7;
  const OTHER_SHOP_GOODS_ID = 8;
  const EARLIER_PURCHASE = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const LATER_PURCHASE = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 2 }).toString();
  const PLACEMENT = { areaId: 1, furnishingItemId: 3, position: { x: 1, y: 0, z: 2 }, rotation: 0.5, sceneId: 2001 };
  const OTHER_PLACEMENT = {
    areaId: 2,
    furnishingItemId: 4,
    position: { x: 3, y: 0, z: 4 },
    rotation: 0,
    sceneId: 2001,
  };
  const QUICK_SWAP_ITEM_ID = 9;
  const OTHER_QUICK_SWAP_ITEM_ID = 10;
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

  test("a rank claimed on either copy stays claimed after a merge", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, adventureRankRewardsClaimed: [2] };
    const guest = { ...EMPTY_GENSHIN_SAVE, adventureRankRewardsClaimed: [2, 3] };

    expect(mergeGenshinSave(account, guest).adventureRankRewardsClaimed).toStrictEqual([2, 3]);
  });

  test("unions the Archive's opened entries by section and keeps the larger defeat count of each Living Being", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      archive: {
        kills: { [LIVING_BEING_ID]: ACCOUNT_COUNT },
        progress: { ...EMPTY_GENSHIN_SAVE.archive.progress, [ArchiveSection.LivingBeings]: [ENTRY_ID] },
      },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      archive: {
        kills: { [LIVING_BEING_ID]: GUEST_COUNT },
        progress: {
          ...EMPTY_GENSHIN_SAVE.archive.progress,
          [ArchiveSection.Books]: [ENTRY_ID],
          [ArchiveSection.LivingBeings]: [OTHER_ENTRY_ID],
        },
      },
    };

    expect(mergeGenshinSave(account, guest).archive).toStrictEqual({
      kills: { [LIVING_BEING_ID]: GUEST_COUNT },
      progress: {
        ...EMPTY_GENSHIN_SAVE.archive.progress,
        [ArchiveSection.Books]: [ENTRY_ID],
        [ArchiveSection.LivingBeings]: [ENTRY_ID, OTHER_ENTRY_ID],
      },
    });
  });

  test("keeps a tip shown on either copy shown after the merge", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, tips: { shown: [1001] } };
    const guest = { ...EMPTY_GENSHIN_SAVE, tips: { shown: [1002, 1001] } };

    expect(mergeGenshinSave(account, guest).tips).toStrictEqual({ shown: [1001, 1002] });
  });

  test("unions the settled Seelies and the solved puzzles of both copies", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, puzzles: { settledSeelieIds: [SEELIE_ID], solvedPuzzleIds: [PUZZLE_ID] } };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      puzzles: { settledSeelieIds: [OTHER_SEELIE_ID, SEELIE_ID], solvedPuzzleIds: [] },
    };

    expect(mergeGenshinSave(account, guest).puzzles).toStrictEqual({
      settledSeelieIds: [SEELIE_ID, OTHER_SEELIE_ID],
      solvedPuzzleIds: [PUZZLE_ID],
    });
  });

  test("unions the cleared camps of both copies, each camp once", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, clearedCamps: [CLEARED_CAMP] };
    const guest = { ...EMPTY_GENSHIN_SAVE, clearedCamps: [CLEARED_CAMP, OTHER_CLEARED_CAMP] };

    expect(mergeGenshinSave(account, guest).clearedCamps).toStrictEqual([CLEARED_CAMP, OTHER_CLEARED_CAMP]);
  });

  test("keeps a domain cleared on either save cleared after the merge", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, clearedDomains: ["1"] };
    const guest = { ...EMPTY_GENSHIN_SAVE, clearedDomains: ["2"] };

    expect(mergeGenshinSave(account, guest).clearedDomains).toStrictEqual(["1", "2"]);
  });

  test("unions the character trial stages claimed by both copies, each once", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      characterTrials: { claimedStageIds: [TRIAL_STAGE_ID, OTHER_TRIAL_STAGE_ID] },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      characterTrials: { claimedStageIds: [OTHER_TRIAL_STAGE_ID, GUEST_TRIAL_STAGE_ID] },
    };

    expect(mergeGenshinSave(account, guest).characterTrials).toStrictEqual({
      claimedStageIds: [TRIAL_STAGE_ID, OTHER_TRIAL_STAGE_ID, GUEST_TRIAL_STAGE_ID],
    });
  });

  test("keeps the account's opened chests over the guest's", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, openedChests: [CHEST_ID] };
    const guest = { ...EMPTY_GENSHIN_SAVE, openedChests: [OTHER_CHEST_ID] };

    expect(mergeGenshinSave(account, guest).openedChests).toStrictEqual([CHEST_ID]);
  });

  test("keeps the account's placements over the guest's", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, homePlacements: [PLACEMENT] };
    const guest = { ...EMPTY_GENSHIN_SAVE, homePlacements: [OTHER_PLACEMENT] };

    expect(mergeGenshinSave(account, guest).homePlacements).toStrictEqual([PLACEMENT]);
  });

  // The bag is the account's, so the quick swap slots it holds are the account's too
  test("keeps the account's quick swap slots over the guest's", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      inventory: { ...EMPTY_GENSHIN_SAVE.inventory, quickSwapItemIds: [QUICK_SWAP_ITEM_ID] },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      inventory: { ...EMPTY_GENSHIN_SAVE.inventory, quickSwapItemIds: [OTHER_QUICK_SWAP_ITEM_ID] },
    };

    expect(mergeGenshinSave(account, guest).inventory.quickSwapItemIds).toStrictEqual([QUICK_SWAP_ITEM_ID]);
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

  test("keeps the account's bounty hunt over the guest's, and the guest's where the account holds none", () => {
    expect.hasAssertions();
    const accountHunt = {
      bountyId: 1,
      isTargetDefeated: false,
      regionId: 101,
      spawn: [1, 2, 3],
      targetEnemyKindId: 20_101,
    };
    const guestHunt = {
      bountyId: 2,
      isTargetDefeated: false,
      regionId: 102,
      spawn: [4, 5, 6],
      targetEnemyKindId: 20_102,
    };
    const account = { ...EMPTY_GENSHIN_SAVE, reputationBountyHunt: accountHunt };
    const guest = { ...EMPTY_GENSHIN_SAVE, reputationBountyHunt: guestHunt };

    expect(mergeGenshinSave(account, guest).reputationBountyHunt).toStrictEqual(accountHunt);
    expect(mergeGenshinSave(EMPTY_GENSHIN_SAVE, guest).reputationBountyHunt).toStrictEqual(guestHunt);
  });

  test("unions the bounty claims of both copies, keeping the latest of the week's limit", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: 5 }, (_value, index) =>
      Temporal.Instant.fromEpochMilliseconds(0)
        .add({ hours: index + 1 })
        .toString(),
    );
    const account = { ...EMPTY_GENSHIN_SAVE, reputationBountyClaimedAts: claimedAts.slice(0, 2) };
    const guest = { ...EMPTY_GENSHIN_SAVE, reputationBountyClaimedAts: claimedAts.slice(2) };

    expect(mergeGenshinSave(account, guest).reputationBountyClaimedAts).toStrictEqual(
      claimedAts.slice(-REPUTATION_WEEKLY_CLAIM_LIMIT),
    );
  });

  test("unions the request claims of both copies, kept apart from the bounty claims", () => {
    expect.hasAssertions();
    const claimedAts = Array.from({ length: 5 }, (_value, index) =>
      Temporal.Instant.fromEpochMilliseconds(0)
        .add({ hours: index + 1 })
        .toString(),
    );
    const account = { ...EMPTY_GENSHIN_SAVE, reputationRequestClaimedAts: claimedAts.slice(0, 2) };
    const guest = { ...EMPTY_GENSHIN_SAVE, reputationRequestClaimedAts: claimedAts.slice(2) };
    const merged = mergeGenshinSave(account, guest);

    expect(merged.reputationRequestClaimedAts).toStrictEqual(claimedAts.slice(-REPUTATION_WEEKLY_CLAIM_LIMIT));
    expect(merged.reputationBountyClaimedAts).toStrictEqual([]);
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

  test("keeps the account's equipped namecard over the guest's", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, namecardItemId: 210_901 };
    const guest = { ...EMPTY_GENSHIN_SAVE, namecardItemId: 210_902 };

    expect(mergeGenshinSave(account, guest).namecardItemId).toBe(210_901);
  });

  test("keeps the guest's equipped namecard while the account has equipped none", () => {
    expect.hasAssertions();
    const guest = { ...EMPTY_GENSHIN_SAVE, namecardItemId: 210_902 };

    expect(mergeGenshinSave(EMPTY_GENSHIN_SAVE, guest).namecardItemId).toBe(210_902);
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

  test("keeps the Encounter Points earned on the later daily reset", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, encounterPoints: { earnedOn: "1970-01-01T00:00:00Z", halfPoints: 6 } };
    const guest = { ...EMPTY_GENSHIN_SAVE, encounterPoints: { earnedOn: "1970-01-02T00:00:00Z", halfPoints: 2 } };

    expect(mergeGenshinSave(account, guest).encounterPoints).toStrictEqual(guest.encounterPoints);
  });

  test("keeps the larger count of Encounter Points when both copies earned them on the same daily reset", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, encounterPoints: { earnedOn: "1970-01-01T00:00:00Z", halfPoints: 2 } };
    const guest = { ...EMPTY_GENSHIN_SAVE, encounterPoints: { earnedOn: "1970-01-01T00:00:00Z", halfPoints: 6 } };

    expect(mergeGenshinSave(account, guest).encounterPoints).toStrictEqual(guest.encounterPoints);
  });

  test("keeps the Frostbearing Tree's progress of the copy that has reached the further level", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      offerings: { frostbearingTree: { heldCounts: { 1: 4 }, level: ACCOUNT_LEVEL } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      offerings: { frostbearingTree: { heldCounts: { 1: 9 }, level: GUEST_LEVEL } },
    };

    expect(mergeGenshinSave(account, guest).offerings).toStrictEqual({
      frostbearingTree: { heldCounts: { 1: 9 }, level: GUEST_LEVEL },
    });
  });

  test("keeps the Frostbearing Tree's progress that holds more items on the same level", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      offerings: { frostbearingTree: { heldCounts: { 1: 4 }, level: ACCOUNT_LEVEL } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      offerings: { frostbearingTree: { heldCounts: { 1: 9 }, level: ACCOUNT_LEVEL } },
    };

    expect(mergeGenshinSave(account, guest).offerings).toStrictEqual({
      frostbearingTree: { heldCounts: { 1: 9 }, level: ACCOUNT_LEVEL },
    });
  });

  test("merged saves keep every found Oculus", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, statues: { foundOculusIds: [OCULUS_ID, SHARED_OCULUS_ID], regions: {} } };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      statues: { foundOculusIds: [SHARED_OCULUS_ID, GUEST_OCULUS_ID], regions: {} },
    };

    expect(mergeGenshinSave(account, guest).statues).toStrictEqual({
      foundOculusIds: [OCULUS_ID, SHARED_OCULUS_ID, GUEST_OCULUS_ID],
      regions: {},
    });
  });

  test("a region only one save holds is kept as it is", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, statues: { foundOculusIds: [], regions: {} } };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      statues: { foundOculusIds: [], regions: { [REGION_ID]: { heldCount: 2, level: 1 } } },
    };

    expect(mergeGenshinSave(account, guest).statues.regions).toStrictEqual({ [REGION_ID]: { heldCount: 2, level: 1 } });
  });

  test("a region both saves hold is the save further on", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      statues: { foundOculusIds: [], regions: { [REGION_ID]: { heldCount: 4, level: ACCOUNT_LEVEL } } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      statues: { foundOculusIds: [], regions: { [REGION_ID]: { heldCount: 1, level: GUEST_LEVEL } } },
    };

    expect(mergeGenshinSave(account, guest).statues.regions).toStrictEqual({
      [REGION_ID]: { heldCount: 1, level: GUEST_LEVEL },
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

  test("a dish keeps the higher proficiency of the two copies", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: { ...EMPTY_GENSHIN_SAVE.cooking, proficiencies: { [COOKING_DISH_ID]: 3 } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: { ...EMPTY_GENSHIN_SAVE.cooking, proficiencies: { [COOKING_DISH_ID]: 5 } },
    };

    expect(mergeGenshinSave(account, guest).cooking.proficiencies).toStrictEqual({ [COOKING_DISH_ID]: 5 });
  });

  test("the learned dishes of both copies union", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: { ...EMPTY_GENSHIN_SAVE.cooking, learnedRecipeIds: [COOKING_DISH_ID] },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: { ...EMPTY_GENSHIN_SAVE.cooking, learnedRecipeIds: [OTHER_COOKING_DISH_ID] },
    };

    expect(mergeGenshinSave(account, guest).cooking.learnedRecipeIds).toStrictEqual([
      COOKING_DISH_ID,
      OTHER_COOKING_DISH_ID,
    ]);
  });

  test("a processing queue keeps the copy started later", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: {
        ...EMPTY_GENSHIN_SAVE.cooking,
        processingJobs: {
          [OTHER_PROCESSING_ID]: { count: 2, startedAt: EARLIER_START },
          [PROCESSING_ID]: { count: 1, startedAt: EARLIER_START },
        },
      },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      cooking: {
        ...EMPTY_GENSHIN_SAVE.cooking,
        processingJobs: { [PROCESSING_ID]: { count: 3, startedAt: LATER_START } },
      },
    };

    expect(mergeGenshinSave(account, guest).cooking.processingJobs).toStrictEqual({
      [OTHER_PROCESSING_ID]: { count: 2, startedAt: EARLIER_START },
      [PROCESSING_ID]: { count: 3, startedAt: LATER_START },
    });
  });

  test("keeps the later purchase of a good both copies bought, and a good only one copy bought", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      shopPurchases: [{ count: 1, goodsId: SHOP_GOODS_ID, lastPurchasedAt: EARLIER_PURCHASE }],
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      shopPurchases: [
        { count: 2, goodsId: SHOP_GOODS_ID, lastPurchasedAt: LATER_PURCHASE },
        { count: 1, goodsId: OTHER_SHOP_GOODS_ID, lastPurchasedAt: EARLIER_PURCHASE },
      ],
    };

    expect(mergeGenshinSave(account, guest).shopPurchases).toStrictEqual([
      { count: 2, goodsId: SHOP_GOODS_ID, lastPurchasedAt: LATER_PURCHASE },
      { count: 1, goodsId: OTHER_SHOP_GOODS_ID, lastPurchasedAt: EARLIER_PURCHASE },
    ]);
  });

  test("keeps each enemy's respawn instant as the later of the two copies', and one only a copy holds", () => {
    expect.hasAssertions();
    const EARLIER_RESPAWN = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 4 }).toString();
    const LATER_RESPAWN = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 28 }).toString();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      enemyRespawns: { "mondstadt-camp-1|enemy-1": LATER_RESPAWN, "mondstadt-camp-1|enemy-2": EARLIER_RESPAWN },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      enemyRespawns: {
        "mondstadt-camp-1|enemy-1": EARLIER_RESPAWN,
        "mondstadt-camp-1|enemy-2": LATER_RESPAWN,
        "mondstadt-camp-1|enemy-3": EARLIER_RESPAWN,
      },
    };

    expect(mergeGenshinSave(account, guest).enemyRespawns).toStrictEqual({
      "mondstadt-camp-1|enemy-1": LATER_RESPAWN,
      "mondstadt-camp-1|enemy-2": LATER_RESPAWN,
      "mondstadt-camp-1|enemy-3": EARLIER_RESPAWN,
    });
  });
  test("keeps each chamber cleared if either save cleared it, its most stars, and the rewards either save claimed", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      spiralAbyss: { corridor: { chambers: { "1": { isCleared: true, stars: 1 } }, claimedRewardIds: [101] } },
    };
    const guest = {
      ...EMPTY_GENSHIN_SAVE,
      spiralAbyss: {
        corridor: {
          chambers: { "1": { isCleared: false, stars: 3 }, "2": { isCleared: true, stars: 2 } },
          claimedRewardIds: [101, 102],
        },
      },
    };

    expect(mergeGenshinSave(account, guest).spiralAbyss).toStrictEqual({
      corridor: {
        chambers: { "1": { isCleared: true, stars: 3 }, "2": { isCleared: true, stars: 2 } },
        claimedRewardIds: [101, 102],
      },
    });
  });

  test("keeps a Moon Spire period only one save holds as it is", () => {
    expect.hasAssertions();
    const account = {
      ...EMPTY_GENSHIN_SAVE,
      spiralAbyss: { "124": { chambers: { "9": { isCleared: true, stars: 3 } }, claimedRewardIds: [201] } },
    };

    expect(mergeGenshinSave(account, EMPTY_GENSHIN_SAVE).spiralAbyss).toStrictEqual(account.spiralAbyss);
  });

  test("keeps the Long-Term Encounter Points of the later major version", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, longTermEncounterPoints: { halfPoints: 6, majorVersion: 5 } };
    const guest = { ...EMPTY_GENSHIN_SAVE, longTermEncounterPoints: { halfPoints: 2, majorVersion: 6 } };

    expect(mergeGenshinSave(account, guest).longTermEncounterPoints).toStrictEqual(guest.longTermEncounterPoints);
  });

  test("keeps the larger count of Long-Term Encounter Points within one major version", () => {
    expect.hasAssertions();
    const account = { ...EMPTY_GENSHIN_SAVE, longTermEncounterPoints: { halfPoints: 2, majorVersion: 6 } };
    const guest = { ...EMPTY_GENSHIN_SAVE, longTermEncounterPoints: { halfPoints: 6, majorVersion: 6 } };

    expect(mergeGenshinSave(account, guest).longTermEncounterPoints).toStrictEqual(guest.longTermEncounterPoints);
  });
});
