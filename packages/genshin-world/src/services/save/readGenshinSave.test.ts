import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";
import type { CharacterSave } from "#src/models/character/CharacterSave";
import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { PartySave } from "#src/models/party/PartySave";
import type { GenshinSave } from "#src/models/save/GenshinSave";
import type { Weapon } from "#src/models/weapon/Weapon";
import type { WeaponData } from "#src/models/weapon/WeaponData";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { DestroyRule } from "#src/models/inventory/DestroyRule";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { COMMISSION_UNLOCK_RANK, COMMISSIONS_PER_DAY } from "#src/services/commission/constants";
import { EMPTY_CURRENCIES, SIGIL_CURRENCIES } from "#src/services/inventory/constants";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { readGenshinSave } from "#src/services/save/readGenshinSave";
import { toGenshinSave } from "#src/services/save/toGenshinSave";
import { ItemCategory } from "genshin-interface";
import { BannerKind } from "genshin-interface/save";
import { describe, expect, test } from "vitest";

describe(readGenshinSave, () => {
  const ACHIEVEMENT_ID = "5";
  // A Living Being defeated and its entry opened in the Archive, the defeat counted once
  const ARCHIVE_ENTRY_ID = 1;
  const ARCHIVE_KILL_COUNT = 1;
  const FINISHED_AT = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).toString();
  const ADVENTURE_EXP = 1200;
  const CHARACTER_ID = 6;
  const CHARACTER_COPY_COUNT = 2;
  const CHARACTER_LEVEL = 5;
  const COMPANIONSHIP_EXP = 300;
  const RECIPE_ID = 22_007;
  const CRAFTED_COUNT = 4;
  // A dish learned and brought to proficiency three, and a processing with two units queued from its first start
  const COOKING_RECIPE_ID = 2;
  const COOKING_PROFICIENCY = 3;
  const PROCESSING_RECIPE_ID = 4;
  const PROCESSING_STARTED_AT = Temporal.Instant.fromEpochMilliseconds(0).toString();
  const COOKING_SAVE: GenshinSave["cooking"] = {
    learnedRecipeIds: [COOKING_RECIPE_ID],
    processingJobs: { [PROCESSING_RECIPE_ID]: { count: 2, startedAt: PROCESSING_STARTED_AT } },
    proficiencies: { [COOKING_RECIPE_ID]: COOKING_PROFICIENCY },
  };
  const REPUTATION = { exp: 150, level: 2 };
  // The Frostbearing Tree offered to: the count held of each item toward its next level, by the item's id, and the level
  // It has reached
  const FROSTBEARING_TREE_PROGRESS = { heldCounts: { 1001: 3 }, level: 2 };
  // A region's statues offered to: the Oculi held toward its next level and the level it has reached, and one Oculus
  // Found in it
  const STATUE_REGION_ID = "1";
  const STATUE_REGION_PROGRESS = { heldCount: 1, level: 2 };
  const FOUND_OCULUS_ID = "2";
  // A Seelie settled in its court and a puzzle solved, each by its id
  const SETTLED_SEELIE_ID = "seelie-1";
  const SOLVED_PUZZLE_ID = "puzzle-1";
  // A furnishing placed in the realm: its item, the area of its scene it stands in and where, and the turn it faces
  const PLACEMENT = { areaId: 1, furnishingItemId: 3, position: { x: 1, y: 0, z: 2 }, rotation: 0.5, sceneId: 2001 };
  // A weapon forged from a recipe and one drawn from a wish, each in the bag as an entry of its own
  const EQUIPPED_GADGET_ID = 1001;
  const FORGED_WEAPON_ID = 13_401;
  const FORGED_NAME_TEXT_ID = "1";
  const WISHED_WEAPON_ID = 11_101;
  const WISHED_NAME_TEXT_ID = "2";
  const NAMES = { [FORGED_NAME_TEXT_ID]: "Forged", [WISHED_NAME_TEXT_ID]: "Wished" };
  const WEAPON_DATA_MAP = new Map<number, WeaponData>([
    [
      FORGED_WEAPON_ID,
      {
        ascensionPhases: [],
        baseExp: 0,
        destroyReturnMaterial: 0,
        destroyReturnMaterialCount: 0,
        destroyRule: DestroyRule.None,
        growAttributes: [],
        id: FORGED_WEAPON_ID,
        nameTextId: FORGED_NAME_TEXT_ID,
        passiveNameTextId: "",
        passiveRankAttributeLines: [],
        passiveRankDescriptionTextIds: [],
        passiveRankParams: [],
        rarity: 4,
        refinementCosts: [],
        refinementMaterialId: 0,
        weaponType: WeaponType.Claymore,
      },
    ],
    [
      WISHED_WEAPON_ID,
      {
        ascensionPhases: [],
        baseExp: 0,
        destroyReturnMaterial: 0,
        destroyReturnMaterialCount: 0,
        destroyRule: DestroyRule.None,
        growAttributes: [],
        id: WISHED_WEAPON_ID,
        nameTextId: WISHED_NAME_TEXT_ID,
        passiveNameTextId: "",
        passiveRankAttributeLines: [],
        passiveRankDescriptionTextIds: [],
        passiveRankParams: [],
        rarity: 3,
        refinementCosts: [],
        refinementMaterialId: 0,
        weaponType: WeaponType.Sword,
      },
    ],
  ]);
  const WISH_COUNT = 3;
  const LANDMARK_ID = "1";
  const CHEST_ID = "chest-1";
  const QUEST_ID = "3";
  const ARTIFACT: Artifact = {
    experience: 120,
    isLocked: true,
    level: 4,
    mainAffix: Attribute.Health,
    minorAffixes: [{ attribute: Attribute.Defense, value: 10 }],
    rarity: 4,
    setId: 1,
    slot: ArtifactSlot.FlowerOfLife,
  };
  const TALENT_LEVELS: TalentLevels = {
    [CombatTalent.ElementalBurst]: 2,
    [CombatTalent.ElementalSkill]: 3,
    [CombatTalent.NormalAttack]: 4,
  };
  const WEAPON: Weapon = { ascension: 1, experience: 300, id: 1, level: 20, refinement: 2 };
  // A character a wish granted at level five with two copies, wearing an artifact and wielding a weapon
  const HELD_CHARACTER_SAVE: CharacterSave = {
    artifacts: [ARTIFACT],
    ascension: 1,
    constellationCount: 0,
    copyCount: CHARACTER_COPY_COUNT,
    id: CHARACTER_ID,
    level: CHARACTER_LEVEL,
    stellaFortunaCount: 0,
    talentLevels: TALENT_LEVELS,
    weapon: WEAPON,
  };
  // The same character as the world holds it, its Companionship EXP none while the save holds none
  const HELD_CHARACTER: Character = {
    artifacts: [ARTIFACT],
    ascension: 1,
    constellationCount: 0,
    friendshipExp: 0,
    id: CHARACTER_ID,
    level: CHARACTER_LEVEL,
    stellaFortunaCount: 0,
    talentLevels: TALENT_LEVELS,
    weapon: WEAPON,
  };
  // A rostered character keeps its Companionship EXP's key in the save, at none while it has earned none
  const HELD_SAVE: GenshinSave = {
    ...EMPTY_GENSHIN_SAVE,
    characters: [HELD_CHARACTER_SAVE],
    companionshipExp: { [CHARACTER_ID]: 0 },
  };
  // The party of a player with a second team deployed, its second member on the field and the first held character down
  const PARTY_SAVE: PartySave = {
    activeIndex: 1,
    deployedTeamIndex: 1,
    downCharacterIds: [CHARACTER_ID],
    teams: [
      { characterIds: [CHARACTER_ID], name: "" },
      { characterIds: [CHARACTER_ID, 7], name: "Second" },
      { characterIds: [], name: "" },
      { characterIds: [], name: "" },
    ],
  };
  const POPULATED_SAVE: GenshinSave = {
    ...EMPTY_GENSHIN_SAVE,
    achievements: { [ACHIEVEMENT_ID]: { count: 1, finishedAt: FINISHED_AT } },
    adventureExp: ADVENTURE_EXP,
    characters: [HELD_CHARACTER_SAVE],
    companionshipExp: { [CHARACTER_ID]: COMPANIONSHIP_EXP },
    cooking: COOKING_SAVE,
    crafting: { craftedCounts: { [RECIPE_ID]: CRAFTED_COUNT }, learnedRecipeIds: [RECIPE_ID] },
    homePlacements: [PLACEMENT],
    inventory: {
      equippedGadgetItemId: EQUIPPED_GADGET_ID,
      items: [
        {
          ascension: 0,
          experience: 0,
          id: 0,
          itemId: FORGED_WEAPON_ID,
          kind: InventoryItemKind.Weapon,
          level: 1,
          quantity: 1,
          refinement: 1,
        },
        {
          ascension: 0,
          experience: 0,
          id: 1,
          itemId: WISHED_WEAPON_ID,
          kind: InventoryItemKind.Weapon,
          level: 1,
          quantity: 1,
          refinement: 1,
        },
      ],
      nextId: 2,
    },
    offerings: { frostbearingTree: FROSTBEARING_TREE_PROGRESS },
    openedChests: [CHEST_ID],
    party: PARTY_SAVE,
    puzzles: { settledSeelieIds: [SETTLED_SEELIE_ID], solvedPuzzleIds: [SOLVED_PUZZLE_ID] },
    quests: { [QUEST_ID]: { objectiveCounts: [1], stepIndex: 1 } },
    reputation: REPUTATION,
    statues: { foundOculusIds: [FOUND_OCULUS_ID], regions: { [STATUE_REGION_ID]: STATUE_REGION_PROGRESS } },
    unlockedLandmarks: [LANDMARK_ID],
    wishPity: {
      ...EMPTY_GENSHIN_SAVE.wishPity,
      [BannerKind.Standard]: { ...EMPTY_GENSHIN_SAVE.wishPity[BannerKind.Standard], wishCount: WISH_COUNT },
    },
  };

  // A save as the player comes back to the realm: written, then read again
  const visit = (save: GenshinSave) =>
    readGenshinSave(
      toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map())),
      NAMES,
      WEAPON_DATA_MAP,
      new Map(),
      new Map(),
    );

  test("reads a save back to the same save once written", () => {
    expect.hasAssertions();
    expect(
      toGenshinSave(readGenshinSave(EMPTY_GENSHIN_SAVE, NAMES, WEAPON_DATA_MAP, new Map(), new Map())),
    ).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });

  test("a claimed rank reward stays claimed after a reload", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, adventureRankRewardsClaimed: [2, 3] };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map()))).toStrictEqual(save);
  });

  // The Traveler's birthday and the mails held come back as they were saved
  test("a traveler birthday and the mails held survive a reload", () => {
    expect.hasAssertions();

    const save = {
      ...EMPTY_GENSHIN_SAVE,
      mails: [{ deliveredAt: new Date(0).toISOString(), id: 35, isClaimed: false, isRead: false }],
      travelerBirthday: { day: 13, month: 10 },
    };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map()))).toStrictEqual(save);
  });

  test("the tips shown return after a visit", () => {
    expect.hasAssertions();
    expect(visit({ ...EMPTY_GENSHIN_SAVE, tips: { shown: [1001] } }).shownTipIds).toStrictEqual(new Set([1001]));
  });

  test("the deployed team and member on field return after a visit", () => {
    expect.hasAssertions();
    const { party } = visit({ ...EMPTY_GENSHIN_SAVE, party: PARTY_SAVE });

    expect({ activeIndex: party.activeIndex, deployedTeamIndex: party.deployedTeamIndex }).toStrictEqual({
      activeIndex: 1,
      deployedTeamIndex: 1,
    });
  });

  test("a save's cooking reads back as the progress and queues it holds", () => {
    expect.hasAssertions();
    const { cookingProgress, processingJobs } = readGenshinSave(
      { ...EMPTY_GENSHIN_SAVE, cooking: COOKING_SAVE },
      NAMES,
      WEAPON_DATA_MAP,
      new Map(),
      new Map(),
    );

    expect(cookingProgress).toStrictEqual({
      learnedRecipeIds: [COOKING_RECIPE_ID],
      proficiencies: { [COOKING_RECIPE_ID]: COOKING_PROFICIENCY },
    });
    expect(processingJobs).toStrictEqual({
      [PROCESSING_RECIPE_ID]: { count: 2, startedAt: Temporal.Instant.from(PROCESSING_STARTED_AT) },
    });
  });

  test("a new player starts with no region started and no Oculus found", () => {
    expect.hasAssertions();
    const { foundOculusIds, regionStatueProgressMap } = readGenshinSave(
      EMPTY_GENSHIN_SAVE,
      NAMES,
      WEAPON_DATA_MAP,
      new Map(),
      new Map(),
    );

    expect(regionStatueProgressMap).toStrictEqual(new Map());
    expect(foundOculusIds).toStrictEqual(new Set());
  });

  test("reads every system a save holds back to the same save once written", () => {
    expect.hasAssertions();
    expect(toGenshinSave(readGenshinSave(POPULATED_SAVE, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(
      POPULATED_SAVE,
    );
  });

  test("placements are kept across a return to the realm", () => {
    expect.hasAssertions();
    const { homePlacements } = visit({ ...EMPTY_GENSHIN_SAVE, homePlacements: [PLACEMENT] });

    expect(homePlacements).toStrictEqual([PLACEMENT]);
  });

  // The day's four as the player was dealt them after the daily reset, the first of them already claimed
  test("the day's four survive a reload before the daily reset", () => {
    expect.hasAssertions();
    const save: GenshinSave = {
      ...EMPTY_GENSHIN_SAVE,
      commissionDay: {
        claimedCommissionIds: [1],
        dealtAt: Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 5 }).toString(),
        dealtCommissions: Array.from({ length: COMMISSIONS_PER_DAY }, (_value, index) => ({
          commissionId: index + 1,
          count: 0,
          dealtRank: COMMISSION_UNLOCK_RANK,
        })),
      },
    };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(save);
  });

  test("opened entries and counts survive a reload", () => {
    expect.hasAssertions();
    const save: GenshinSave = {
      ...EMPTY_GENSHIN_SAVE,
      archive: {
        kills: { [ARCHIVE_ENTRY_ID]: ARCHIVE_KILL_COUNT },
        progress: { ...EMPTY_GENSHIN_SAVE.archive.progress, [ArchiveSection.LivingBeings]: [ARCHIVE_ENTRY_ID] },
      },
    };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(save);
  });

  test("a held character survives a reload", () => {
    expect.hasAssertions();
    const { characterCopyCountMap, characters } = readGenshinSave(
      HELD_SAVE,
      NAMES,
      WEAPON_DATA_MAP,
      new Map(),
      new Map(),
    );

    expect(characters).toStrictEqual([HELD_CHARACTER]);
    expect(characterCopyCountMap).toStrictEqual(new Map([[CHARACTER_ID, CHARACTER_COPY_COUNT]]));
    expect(toGenshinSave(readGenshinSave(HELD_SAVE, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(
      HELD_SAVE,
    );
  });

  test("companionship EXP is restored on the character it was earned by", () => {
    expect.hasAssertions();
    const { characters } = readGenshinSave(
      { ...HELD_SAVE, companionshipExp: { [CHARACTER_ID]: COMPANIONSHIP_EXP } },
      NAMES,
      WEAPON_DATA_MAP,
      new Map(),
      new Map(),
    );

    expect(characters).toStrictEqual([{ ...HELD_CHARACTER, friendshipExp: COMPANIONSHIP_EXP }]);
  });

  test("a character missing from the roster keeps its saved Companionship EXP", () => {
    expect.hasAssertions();
    const save = { ...EMPTY_GENSHIN_SAVE, companionshipExp: { [CHARACTER_ID]: COMPANIONSHIP_EXP } };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(save);
  });

  test("reads a bag's forged and wished weapons back as weapons, each named and rarity from its own data", () => {
    expect.hasAssertions();
    expect(readGenshinSave(POPULATED_SAVE, NAMES, WEAPON_DATA_MAP, new Map(), new Map()).inventory).toStrictEqual({
      equippedGadgetItemId: EQUIPPED_GADGET_ID,
      items: [
        {
          ascension: 0,
          definition: {
            category: ItemCategory.Weapon,
            destroyReturnMaterial: 0,
            destroyReturnMaterialCount: 0,
            destroyRule: DestroyRule.None,
            id: FORGED_WEAPON_ID,
            name: NAMES[FORGED_NAME_TEXT_ID],
            rank: 0,
            rarity: 4,
            stackLimit: 1,
          },
          experience: 0,
          id: 0,
          level: 1,
          quantity: 1,
          refinement: 1,
        },
        {
          ascension: 0,
          definition: {
            category: ItemCategory.Weapon,
            destroyReturnMaterial: 0,
            destroyReturnMaterialCount: 0,
            destroyRule: DestroyRule.None,
            id: WISHED_WEAPON_ID,
            name: NAMES[WISHED_NAME_TEXT_ID],
            rank: 0,
            rarity: 3,
            stackLimit: 1,
          },
          experience: 0,
          id: 1,
          level: 1,
          quantity: 1,
          refinement: 1,
        },
      ],
      nextId: 2,
    });
  });

  test("a limited good's purchase survives a reload", () => {
    expect.hasAssertions();
    const save: GenshinSave = {
      ...EMPTY_GENSHIN_SAVE,
      shopPurchases: [{ count: 2, goodsId: 7, lastPurchasedAt: Temporal.Instant.fromEpochMilliseconds(0).toString() }],
    };

    expect(toGenshinSave(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map(), new Map()))).toStrictEqual(save);
  });

  test("a save written before the Sigils were added reads each Sigil as zero", () => {
    expect.hasAssertions();
    const currencies = Object.fromEntries(
      Object.entries(EMPTY_CURRENCIES).filter(([currency]) => !SIGIL_CURRENCIES.some((sigil) => sigil === currency)),
    );
    const save: GenshinSave = { ...EMPTY_GENSHIN_SAVE, wallet: { ...EMPTY_GENSHIN_SAVE.wallet, currencies } };

    expect(readGenshinSave(save, NAMES, WEAPON_DATA_MAP, new Map(), new Map()).wallet[Currency.AnemoSigil]).toBe(0);
  });
});
