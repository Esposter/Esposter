import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute, Attributes } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { partySaveSchema } from "#src/models/party/PartySave";
import { genshinSaveSchema } from "#src/models/save/GenshinSave";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { COMMISSIONS_PER_DAY, MAX_ENCOUNTER_HALF_POINTS } from "#src/services/commission/constants";
import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";
import { GCG_REWARDABLE_GAME_COUNT } from "#src/services/gcg/constants";
import {
  MAX_HOME_BLUEPRINT_COUNT,
  MAX_HOME_COMPANION_COUNT,
  MAX_HOME_ORDER_COUNT,
  MAX_HOME_PLACEMENT_COUNT,
  MAX_HOME_REWARD_CLAIM_COUNT,
} from "#src/services/home/constants";
import { EMPTY_CURRENCIES, SIGIL_CURRENCIES } from "#src/services/inventory/constants";
import { INVESTIGATION_DAILY_CAP } from "#src/services/investigation/constants";
import { MAX_MAIL_COUNT } from "#src/services/mail/constants";
import { PARTY_TEAM_MAX_COUNT, PARTY_TEAM_SIZE } from "#src/services/party/constants";
import { REPUTATION_WEEKLY_CLAIM_LIMIT } from "#src/services/reputation/constants";
import {
  EMPTY_GENSHIN_SAVE,
  MAX_ABYSS_CHAMBER_COUNT,
  MAX_ABYSS_CYCLE_COUNT,
  MAX_ACHIEVEMENT_COUNT,
  MAX_ARCHIVE_ENTRY_COUNT,
  MAX_ARCHIVE_KILL_COUNT,
  MAX_CHARACTER_COUNT,
  MAX_CLEARED_CAMP_COUNT,
  MAX_CLEARED_DOMAIN_COUNT,
  MAX_COOKING_RECIPE_COUNT,
  MAX_CRAFTING_RECIPE_COUNT,
  MAX_ENEMY_RESPAWN_COUNT,
  MAX_FOUND_OCULUS_COUNT,
  MAX_INVENTORY_ITEM_COUNT,
  MAX_OBJECTIVE_COUNT,
  MAX_OFFERING_ITEM_KIND_COUNT,
  MAX_OPENED_CHEST_COUNT,
  MAX_PARTY_TEAM_NAME_LENGTH,
  MAX_QUEST_COUNT,
  MAX_SAVE_ID_LENGTH,
  MAX_SETTLED_SEELIE_COUNT,
  MAX_SHOP_PURCHASE_COUNT,
  MAX_SHOWN_TIP_COUNT,
  MAX_SOLVED_PUZZLE_COUNT,
  MAX_STATUE_REGION_COUNT,
  MAX_TRAVELER_NAME_LENGTH,
  MAX_UNLOCKED_LANDMARK_COUNT,
  MAX_WISH_HISTORY_COUNT,
} from "#src/services/save/constants";
import { MAX_WEAPON_REFINEMENT } from "#src/services/weapon/constants";
import { CONSTELLATION_COUNT } from "#src/services/wish/constants";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe("genshinSaveSchema", () => {
  const baseMail = { deliveredAt: new Date(0).toISOString(), id: 1, isClaimed: false, isPinned: false, isRead: false };
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);

  // The ceiling is each collection's cap times its longest entry, so a save with every collection at its cap, each
  // Number at its largest and each instant at its longest, is under it and passes the refine
  test("accepts a save at every cap, each number and instant at its longest", () => {
    expect.hasAssertions();
    const maxNumber = Number.MAX_SAFE_INTEGER;
    const maxInstant = epoch.add({ nanoseconds: 999_999_999 }).toString();
    // A bag of artifacts at its cap, each at its longest, since an artifact is the longest entry the bag holds
    const artifactItems = Array.from({ length: MAX_INVENTORY_ITEM_COUNT }, (_value, index) => ({
      artifact: {
        experience: maxNumber,
        isLocked: true,
        itemId: maxNumber - index,
        level: maxNumber,
        mainAffix: Attribute.StellarGlimmerReactionDamageBonus,
        minorAffixes: Attributes.slice(0, MAX_MINOR_AFFIX_COUNT).map((attribute) => ({
          attribute,
          value: -Number.MAX_VALUE,
        })),
        rarity: maxNumber,
        setId: maxNumber,
        slot: ArtifactSlot.PlumeOfDeath,
      },
      id: maxNumber - index,
      itemId: maxNumber - index,
      kind: InventoryItemKind.Artifact,
      quantity: 1,
    }));
    const save = {
      achievements: Object.fromEntries(
        Array.from({ length: MAX_ACHIEVEMENT_COUNT }, (_value, index) => [
          String(maxNumber - index),
          { count: maxNumber, finishedAt: maxInstant },
        ]),
      ),
      adventureExp: maxNumber,
      adventureRankRewardsClaimed: Array.from({ length: MAX_ADVENTURE_RANK - 1 }, (_value, index) => index + 2),
      archive: {
        kills: Object.fromEntries(
          Array.from({ length: MAX_ARCHIVE_KILL_COUNT }, (_value, index) => [
            String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
            maxNumber,
          ]),
        ),
        progress: Object.fromEntries(
          Object.values(ArchiveSection).map((section) => [
            section,
            Array.from({ length: MAX_ARCHIVE_ENTRY_COUNT }, (_value, index) => maxNumber - index),
          ]),
        ),
      },
      cardGameExp: maxNumber,
      cardGameRewardedGameIds: Array.from({ length: GCG_REWARDABLE_GAME_COUNT }, (_value, index) => maxNumber - index),
      characters: Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => ({
        artifacts: Object.values(ArtifactSlot).map((slot) => ({
          experience: maxNumber,
          isLocked: true,
          itemId: 101,
          level: maxNumber,
          mainAffix: Attribute.Health,
          minorAffixes: Attributes.slice(0, MAX_MINOR_AFFIX_COUNT).map((attribute) => ({
            attribute,
            value: maxNumber,
          })),
          rarity: maxNumber,
          setId: maxNumber,
          slot,
        })),
        ascension: maxNumber,
        constellationCount: CONSTELLATION_COUNT,
        copyCount: maxNumber,
        id: maxNumber - index,
        level: maxNumber,
        stellaFortunaCount: maxNumber,
        talentLevels: Object.fromEntries(Object.values(CombatTalent).map((combatTalent) => [combatTalent, maxNumber])),
        weapon: {
          ascension: maxNumber,
          experience: maxNumber,
          id: maxNumber,
          level: maxNumber,
          refinement: MAX_WEAPON_REFINEMENT,
        },
      })),
      characterTrials: { claimedStageIds: [] },
      clearedCamps: Array.from({ length: MAX_CLEARED_CAMP_COUNT }, (_value, index) => ({
        id: String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
        position: { x: maxNumber, z: maxNumber },
      })),
      clearedDomains: Array.from({ length: MAX_CLEARED_DOMAIN_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      commissionDay: {
        claimedCommissionIds: Array.from({ length: COMMISSIONS_PER_DAY }, (_value, index) => maxNumber - index),
        dealtAt: maxInstant,
        dealtCommissions: Array.from({ length: COMMISSIONS_PER_DAY }, (_value, index) => ({
          commissionId: maxNumber - index,
          count: maxNumber,
          dealtRank: maxNumber,
        })),
        isBonusClaimed: false,
      },
      companionshipExp: Object.fromEntries(
        Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => [String(maxNumber - index), maxNumber]),
      ),
      cooking: {
        learnedRecipeIds: Array.from({ length: MAX_COOKING_RECIPE_COUNT }, (_value, index) => maxNumber - index),
        processingJobs: Object.fromEntries(
          Array.from({ length: MAX_COOKING_RECIPE_COUNT }, (_value, index) => [
            String(maxNumber - index),
            { count: maxNumber, startedAt: maxInstant },
          ]),
        ),
        proficiencies: Object.fromEntries(
          Array.from({ length: MAX_COOKING_RECIPE_COUNT }, (_value, index) => [String(maxNumber - index), maxNumber]),
        ),
      },
      crafting: {
        craftedCounts: Object.fromEntries(
          Array.from({ length: MAX_CRAFTING_RECIPE_COUNT }, (_value, index) => [String(maxNumber - index), maxNumber]),
        ),
        learnedRecipeIds: Array.from({ length: MAX_CRAFTING_RECIPE_COUNT }, (_value, index) => maxNumber - index),
      },
      encounterPoints: { earnedOn: maxInstant, halfPoints: MAX_ENCOUNTER_HALF_POINTS },
      enemyRespawns: Object.fromEntries(
        Array.from({ length: MAX_ENEMY_RESPAWN_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          maxInstant,
        ]),
      ),
      homePlacements: Array.from({ length: MAX_HOME_PLACEMENT_COUNT }, () => ({
        areaId: maxNumber,
        furnishingItemId: maxNumber,
        position: { x: -Number.MAX_VALUE, y: -Number.MAX_VALUE, z: -Number.MAX_VALUE },
        rotation: -Number.MAX_VALUE,
        sceneId: maxNumber,
      })),
      homePlantings: Array.from({ length: MAX_HOME_PLACEMENT_COUNT }, (_value, index) => ({
        plantedAt: maxInstant,
        plotId: maxNumber - index,
        seedItemId: maxNumber,
      })),
      homeProgress: {
        claimedRewardIds: Array.from({ length: MAX_HOME_REWARD_CLAIM_COUNT }, (_value, index) => maxNumber - index),
        companionIds: Array.from({ length: MAX_HOME_COMPANION_COUNT }, (_value, index) => maxNumber - index),
        learnedBlueprintIds: Array.from({ length: MAX_HOME_BLUEPRINT_COUNT }, (_value, index) => maxNumber - index),
        madeBlueprintIds: Array.from({ length: MAX_HOME_BLUEPRINT_COUNT }, (_value, index) => maxNumber - index),
        orders: Array.from({ length: MAX_HOME_ORDER_COUNT }, () => ({ blueprintId: maxNumber, startedAt: maxInstant })),
        realmBounty: maxNumber,
        realmBountyAccruedAt: maxInstant,
        realmCurrency: maxNumber,
        realmCurrencyAccruedAt: maxInstant,
        trustExp: maxNumber,
      },
      inventory: {
        items: Array.from({ length: MAX_INVENTORY_ITEM_COUNT }, (_value, index) => ({
          ascension: maxNumber,
          experience: maxNumber,
          id: maxNumber - index,
          itemId: maxNumber - index,
          kind: InventoryItemKind.Weapon,
          level: maxNumber,
          quantity: 1,
          refinement: MAX_WEAPON_REFINEMENT,
        })),
        nextId: maxNumber,
        quickSwapItemIds: Array.from({ length: QUICK_SWAP_GADGET_LIMIT }, () => maxNumber),
      },
      investigationDay: { count: INVESTIGATION_DAILY_CAP, dayKey: maxInstant },
      longTermEncounterPoints: { halfPoints: maxNumber, majorVersion: maxNumber },
      mails: Array.from({ length: MAX_MAIL_COUNT }, (_value, index) => ({
        deliveredAt: maxInstant,
        id: maxNumber - index,
        isClaimed: false,
        isPinned: false,
        isRead: false,
      })),
      namecardItemId: maxNumber,
      offerings: {
        frostbearingTree: {
          heldCounts: Object.fromEntries(
            Array.from({ length: MAX_OFFERING_ITEM_KIND_COUNT }, (_value, index) => [
              String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
              maxNumber,
            ]),
          ),
          level: maxNumber,
        },
      },
      openedChests: Array.from({ length: MAX_OPENED_CHEST_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      party: {
        activeIndex: PARTY_TEAM_SIZE - 1,
        deployedTeamIndex: PARTY_TEAM_MAX_COUNT - 1,
        downCharacterIds: Array.from({ length: MAX_CHARACTER_COUNT }, (_value, index) => maxNumber - index),
        teams: Array.from({ length: PARTY_TEAM_MAX_COUNT }, () => ({
          characterIds: Array.from({ length: PARTY_TEAM_SIZE }, (_value, index) => maxNumber - index),
          name: "a".repeat(MAX_PARTY_TEAM_NAME_LENGTH),
        })),
      },
      puzzles: {
        settledSeelieIds: Array.from({ length: MAX_SETTLED_SEELIE_COUNT }, (_value, index) =>
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
        ),
        solvedPuzzleIds: Array.from({ length: MAX_SOLVED_PUZZLE_COUNT }, (_value, index) =>
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
        ),
      },
      quests: Object.fromEntries(
        Array.from({ length: MAX_QUEST_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          { objectiveCounts: Array.from({ length: MAX_OBJECTIVE_COUNT }, () => maxNumber), stepIndex: maxNumber },
        ]),
      ),
      reputation: { exp: maxNumber, level: maxNumber },
      reputationBountyClaimedAts: Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, () => maxInstant),
      reputationRequestClaimedAts: Array.from({ length: REPUTATION_WEEKLY_CLAIM_LIMIT }, () => maxInstant),
      shopPurchases: Array.from({ length: MAX_SHOP_PURCHASE_COUNT }, (_value, index) => ({
        count: maxNumber,
        goodsId: maxNumber - index,
        lastPurchasedAt: maxInstant,
      })),
      spiralAbyss: Object.fromEntries(
        Array.from({ length: MAX_ABYSS_CYCLE_COUNT }, (_value, index) => [
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
          {
            chambers: Object.fromEntries(
              Array.from({ length: MAX_ABYSS_CHAMBER_COUNT }, (_chamber, chamberIndex) => [
                String(chamberIndex).padStart(MAX_SAVE_ID_LENGTH, "0"),
                { isCleared: true, stars: 3 },
              ]),
            ),
            claimedRewardIds: Array.from({ length: MAX_ABYSS_CHAMBER_COUNT }, () => maxNumber),
          },
        ]),
      ),
      statues: {
        foundOculusIds: Array.from({ length: MAX_FOUND_OCULUS_COUNT }, (_value, index) =>
          String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
        ),
        regions: Object.fromEntries(
          Array.from({ length: MAX_STATUE_REGION_COUNT }, (_value, index) => [
            String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
            { claimedLevel: maxNumber, heldCount: maxNumber, level: maxNumber },
          ]),
        ),
      },
      tips: { queued: [], shown: Array.from({ length: MAX_SHOWN_TIP_COUNT }, (_value, index) => maxNumber - index) },
      travelerBirthday: { day: 31, month: 12 },
      travelerName: "a".repeat(MAX_TRAVELER_NAME_LENGTH),
      unlockedLandmarks: Array.from({ length: MAX_UNLOCKED_LANDMARK_COUNT }, (_value, index) =>
        String(index).padStart(MAX_SAVE_ID_LENGTH, "0"),
      ),
      wallet: {
        currencies: Object.fromEntries(Object.values(Currency).map((currency) => [currency, maxNumber])),
        originalResinChangedAt: maxInstant,
        primogemResinRefillCount: maxNumber,
        primogemResinRefillDay: epoch.toZonedDateTimeISO("UTC").toPlainDate().toString(),
      },
      wishHistory: Array.from({ length: MAX_WISH_HISTORY_COUNT }, () => ({
        bannerKind: BannerKind.CharacterEvent,
        itemId: maxNumber,
        time: maxInstant,
      })),
      wishPity: Object.fromEntries(
        Object.values(BannerKind).map((bannerKind) => [
          bannerKind,
          {
            chartedWeaponId: maxNumber,
            fatePoints: maxNumber,
            fiveStarCount: maxNumber,
            fourStarCount: maxNumber,
            isFiveStarGuaranteed: false,
            isFourStarGuaranteed: false,
            lossCount: maxNumber,
            wishCount: maxNumber,
          },
        ]),
      ),
      worldLevelAdjustment: { changedAt: maxInstant, isLowered: true },
    };

    expect([
      genshinSaveSchema.safeParse(save).success,
      genshinSaveSchema.safeParse({ ...save, inventory: { ...save.inventory, items: artifactItems } }).success,
    ]).toStrictEqual([true, true]);
  });

  // A save holding more characters than the limit is refused, so none of them is read
  test("a save past the character limit is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      // A character held at its least: level one, one copy, and nothing worn or wielded beyond its own weapon
      characters: Array.from({ length: MAX_CHARACTER_COUNT + 1 }, (_value, index) => ({
        artifacts: [],
        ascension: 0,
        constellationCount: 0,
        copyCount: 1,
        id: index + 1,
        level: 1,
        stellaFortunaCount: 0,
        talentLevels: {
          [CombatTalent.ElementalBurst]: 1,
          [CombatTalent.ElementalSkill]: 1,
          [CombatTalent.NormalAttack]: 1,
        },
        weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
      })),
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A save holding more settled Seelies than the limit is refused, as every id slice is bounded
  test("a save past the settled Seelie limit is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      puzzles: {
        ...EMPTY_GENSHIN_SAVE.puzzles,
        settledSeelieIds: Array.from({ length: MAX_SETTLED_SEELIE_COUNT + 1 }, (_value, index) => String(index)),
      },
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A save whose bag holds a fifth quick swap slot is refused, as the quick swap holds up to four gadgets
  test("a save with a fifth quick swap slot is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      inventory: {
        ...EMPTY_GENSHIN_SAVE.inventory,
        quickSwapItemIds: Array.from({ length: QUICK_SWAP_GADGET_LIMIT + 1 }, (_value, index) => index + 1),
      },
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A save from before the mail list has no list, and is refused rather than read as an empty mailbox
  test("a save without its mails is refused", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, mails: undefined };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  test("a save past the mail limit is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      mails: Array.from({ length: MAX_MAIL_COUNT + 1 }, (_value, index) => ({ ...baseMail, id: index + 1 })),
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A mail is held once per delivery, so a birthday mail delivered again on a later birthday is kept beside the copy held
  test("a mail held on two deliveries is kept", () => {
    expect.hasAssertions();
    const mail = { ...baseMail, isClaimed: true, isRead: true };
    const save = { ...EMPTY_GENSHIN_SAVE, mails: [mail, { ...baseMail, deliveredAt: new Date(1).toISOString() }] };

    expect(genshinSaveSchema.safeParse(save).success).toBe(true);
  });

  // A mail held twice on the same delivery is refused, since one delivery is one held mail
  test("a mail held twice on the same delivery is refused", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, mails: [baseMail, { ...baseMail, isRead: true }] };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A save whose bag has no quick swap slots is refused: the field is required, so no save is read without it
  test("a save without quick swap slots is refused", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, inventory: { items: [], nextId: 0 } };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  // A save holding more placements than the realms' areas hold at their furnishing counts is refused, so the list
  // Stays bounded
  test("a save past the placement limit is refused", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      homePlacements: Array.from({ length: MAX_HOME_PLACEMENT_COUNT + 1 }, () => ({
        areaId: 1,
        furnishingItemId: 1,
        position: { x: 0, y: 0, z: 0 },
        rotation: 0,
        sceneId: 2001,
      })),
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  test("the save keeps the learned dishes, the proficiencies and the processing queues", () => {
    expect.hasAssertions();
    const cooking = {
      learnedRecipeIds: [1, 2],
      processingJobs: { 3: { count: 2, startedAt: epoch.toString() } },
      proficiencies: { 1: 3 },
    };

    expect(genshinSaveSchema.parse({ ...EMPTY_GENSHIN_SAVE, cooking }).cooking).toStrictEqual(cooking);
  });

  // A numeric id's key is read back as its number, so a key such as "01" beside "1" would lose one of the two on the
  // Next write
  test("refuses an id key that is not its number's own decimal", () => {
    expect.hasAssertions();
    const save = {
      ...EMPTY_GENSHIN_SAVE,
      crafting: { ...EMPTY_GENSHIN_SAVE.crafting, craftedCounts: { "01": 1, "1": 1 } },
    };

    expect(genshinSaveSchema.safeParse(save).success).toBe(false);
  });

  test("refuses a party whose member on the field is not in the deployed team", () => {
    expect.hasAssertions();
    expect(partySaveSchema.safeParse({ ...EMPTY_GENSHIN_SAVE.party, activeIndex: 1 }).success).toBe(false);
  });

  // A slice a save predates is refused rather than defaulted, a stored save being backfilled to the shape, except the shop
  // Purchases, which start empty, and the Sigils, which the reader counts at zero
  test("refuses a save written before the slices were added", () => {
    expect.hasAssertions();
    const predatingSave = {
      quests: EMPTY_GENSHIN_SAVE.quests,
      unlockedLandmarks: EMPTY_GENSHIN_SAVE.unlockedLandmarks,
      wallet: EMPTY_GENSHIN_SAVE.wallet,
    };

    expect(genshinSaveSchema.safeParse(predatingSave).success).toBe(false);
  });

  test("accepts a save written before the Sigils were added", () => {
    expect.hasAssertions();
    const currencies = Object.fromEntries(
      Object.entries(EMPTY_CURRENCIES).filter(([currency]) => !SIGIL_CURRENCIES.includes(currency)),
    );

    expect(
      genshinSaveSchema.safeParse({ ...EMPTY_GENSHIN_SAVE, wallet: { ...EMPTY_GENSHIN_SAVE.wallet, currencies } })
        .success,
    ).toBe(true);
  });

  test("refuses a save with no card game EXP", () => {
    expect.hasAssertions();

    expect(genshinSaveSchema.safeParse({ ...EMPTY_GENSHIN_SAVE, cardGameExp: undefined }).success).toBe(false);
  });

  test("refuses a list of rewarded games past its cap", () => {
    expect.hasAssertions();

    expect(
      genshinSaveSchema.safeParse({
        ...EMPTY_GENSHIN_SAVE,
        cardGameRewardedGameIds: Array.from({ length: GCG_REWARDABLE_GAME_COUNT + 1 }, (_value, index) => index + 1),
      }).success,
    ).toBe(false);
  });

  test("refuses a save with no Mora", () => {
    expect.hasAssertions();
    const { [Currency.Mora]: _mora, ...currencies } = EMPTY_GENSHIN_SAVE.wallet.currencies;

    expect(
      genshinSaveSchema.safeParse({ ...EMPTY_GENSHIN_SAVE, wallet: { ...EMPTY_GENSHIN_SAVE.wallet, currencies } })
        .success,
    ).toBe(false);
  });
});
