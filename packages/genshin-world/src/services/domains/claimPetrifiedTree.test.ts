import type { Character } from "#src/models/character/Character";
import type { FriendshipLevels } from "#src/models/friendship/FriendshipLevels";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { claimPetrifiedTree } from "#src/services/domains/claimPetrifiedTree";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { ADVENTURE_EXP_PER_RESIN, COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(claimPetrifiedTree, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  const DOMAIN_RESIN = 20;
  const MORA_COUNT = 12_000;
  const REWARD_COUNT = 1;
  const REWARD_ITEM_ID = 9002;
  const REWARD_NAME = "Test Tree Reward";
  const REWARD_NAME_TEXT_ID = "9002";
  const REWARD_STACK_LIMIT = 99;
  const COMPANIONSHIP_EXP = 10;
  const FIRST_CHARACTER_ID = 1;
  const FRIENDSHIP_LEVELS: FriendshipLevels = [
    { exp: 0, level: 1 },
    { exp: 100, level: 2 },
  ];
  const CHARACTER: Character = {
    artifacts: [],
    ascension: 0,
    constellationCount: 0,
    friendshipExp: 0,
    id: FIRST_CHARACTER_ID,
    level: 1,
    stellaFortunaCount: 0,
    talentLevels: {
      [CombatTalent.ElementalBurst]: 1,
      [CombatTalent.ElementalSkill]: 1,
      [CombatTalent.NormalAttack]: 1,
    },
    weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
  };
  const characters = [{ ...CHARACTER, id: TRAVELER_CHARACTER_ID }, CHARACTER];
  const party = createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID]);
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };
  const materialDataMap = new Map<number, MaterialData>([
    [
      REWARD_ITEM_ID,
      {
        id: REWARD_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: REWARD_NAME_TEXT_ID,
        rank: 0,
        rarity: 0,
        stackLimit: REWARD_STACK_LIMIT,
      },
    ],
  ]);

  test("Claiming the tree spends resin and gives its rewards", () => {
    expect.hasAssertions();

    expect(
      claimPetrifiedTree(
        adventureRankTables,
        characters,
        FRIENDSHIP_LEVELS,
        party,
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 1, condensedResinCount: 0, resin: DOMAIN_RESIN },
        [
          { itemId: MORA_ITEM_ID, maxCount: MORA_COUNT, minCount: MORA_COUNT },
          { itemId: REWARD_ITEM_ID, maxCount: REWARD_COUNT, minCount: REWARD_COUNT },
        ],
        () => 0,
        0,
        noQuest,
        epoch,
        { [REWARD_NAME_TEXT_ID]: REWARD_NAME },
        materialDataMap,
      ),
    ).toStrictEqual({
      adventureExp: DOMAIN_RESIN * ADVENTURE_EXP_PER_RESIN,
      characters,
      inventory: {
        items: [
          {
            definition: {
              category: ItemCategory.Material,
              id: REWARD_ITEM_ID,
              name: REWARD_NAME,
              rank: 0,
              rarity: 0,
              stackLimit: REWARD_STACK_LIMIT,
            },
            id: 0,
            quantity: REWARD_COUNT,
          },
        ],
        nextId: 1,
        quickSwapItemIds: [],
      },
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT, [Currency.OriginalResin]: 100 - DOMAIN_RESIN },
    });
  });

  test("claiming the tree gives its Companionship EXP", () => {
    expect.hasAssertions();

    expect(
      claimPetrifiedTree(
        adventureRankTables,
        characters,
        FRIENDSHIP_LEVELS,
        party,
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 1, condensedResinCount: 0, resin: DOMAIN_RESIN },
        [
          { itemId: MORA_ITEM_ID, maxCount: MORA_COUNT, minCount: MORA_COUNT },
          { itemId: COMPANIONSHIP_EXP_ITEM_ID, maxCount: COMPANIONSHIP_EXP, minCount: COMPANIONSHIP_EXP },
        ],
        () => 0,
        0,
        noQuest,
        epoch,
        {},
        materialDataMap,
      ),
    ).toStrictEqual({
      adventureExp: DOMAIN_RESIN * ADVENTURE_EXP_PER_RESIN,
      characters: [
        { ...CHARACTER, id: TRAVELER_CHARACTER_ID },
        { ...CHARACTER, friendshipExp: COMPANIONSHIP_EXP },
      ],
      inventory: EMPTY_INVENTORY,
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT, [Currency.OriginalResin]: 100 - DOMAIN_RESIN },
    });
  });

  test("claiming the tree for two claims spends both claims' resin and gives both claims' rewards", () => {
    expect.hasAssertions();

    expect(
      claimPetrifiedTree(
        adventureRankTables,
        characters,
        FRIENDSHIP_LEVELS,
        party,
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 2, condensedResinCount: 0, resin: 2 * DOMAIN_RESIN },
        [
          { itemId: MORA_ITEM_ID, maxCount: MORA_COUNT, minCount: MORA_COUNT },
          { itemId: REWARD_ITEM_ID, maxCount: REWARD_COUNT, minCount: REWARD_COUNT },
        ],
        () => 0,
        0,
        noQuest,
        epoch,
        { [REWARD_NAME_TEXT_ID]: REWARD_NAME },
        materialDataMap,
      ),
    ).toStrictEqual({
      adventureExp: 2 * DOMAIN_RESIN * ADVENTURE_EXP_PER_RESIN,
      characters,
      inventory: {
        items: [
          {
            definition: {
              category: ItemCategory.Material,
              id: REWARD_ITEM_ID,
              name: REWARD_NAME,
              rank: 0,
              rarity: 0,
              stackLimit: REWARD_STACK_LIMIT,
            },
            id: 0,
            quantity: 2 * REWARD_COUNT,
          },
        ],
        nextId: 1,
        quickSwapItemIds: [],
      },
      wallet: { ...wallet, [Currency.Mora]: 2 * MORA_COUNT, [Currency.OriginalResin]: 100 - 2 * DOMAIN_RESIN },
    });
  });

  test("each of two claims draws its own count of an item between its least and most", () => {
    expect.hasAssertions();

    // The first claim's roll is the least, the second's the most of a range of one to three
    const rolls = [0, 0.99];
    expect(
      claimPetrifiedTree(
        adventureRankTables,
        characters,
        FRIENDSHIP_LEVELS,
        party,
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 2, condensedResinCount: 0, resin: 2 * DOMAIN_RESIN },
        [{ itemId: REWARD_ITEM_ID, maxCount: 3, minCount: 1 }],
        () => rolls.shift() ?? 0,
        0,
        noQuest,
        epoch,
        { [REWARD_NAME_TEXT_ID]: REWARD_NAME },
        materialDataMap,
      )?.inventory.items,
    ).toStrictEqual([
      {
        definition: {
          category: ItemCategory.Material,
          id: REWARD_ITEM_ID,
          name: REWARD_NAME,
          rank: 0,
          rarity: 0,
          stackLimit: REWARD_STACK_LIMIT,
        },
        id: 0,
        quantity: 4,
      },
    ]);
  });

  test("Claiming the tree with too little resin is refused", () => {
    expect.hasAssertions();

    expect(
      claimPetrifiedTree(
        adventureRankTables,
        characters,
        FRIENDSHIP_LEVELS,
        party,
        { ...EMPTY_WALLET, [Currency.OriginalResin]: DOMAIN_RESIN - 1 },
        EMPTY_INVENTORY,
        { claimCount: 1, condensedResinCount: 0, resin: DOMAIN_RESIN },
        [{ itemId: MORA_ITEM_ID, maxCount: MORA_COUNT, minCount: MORA_COUNT }],
        () => 0,
        0,
        noQuest,
        epoch,
        {},
        new Map(),
      ),
    ).toBeUndefined();
  });
});
