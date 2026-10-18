import type { Character } from "#src/models/character/Character";
import type { FriendshipLevel } from "#src/models/friendship/FriendshipLevel";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { routeCommissionClaim } from "#src/services/commission/routeCommissionClaim";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { COMPANIONSHIP_EXP_ITEM_ID } from "#src/services/originalResin/constants";
import { createParty } from "#src/services/party/createParty";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(routeCommissionClaim, () => {
  const noQuest = new Set<string>();
  const FIRST_CHARACTER_ID = 1;
  const ITEM_ID = 2000;
  const ITEM_COUNT = 3;
  const MORA_COUNT = 1000;
  const ADVENTURE_EXP = 50;
  const COMPANIONSHIP_EXP = 10;
  const STARTING_MORA = 500;
  const NAME_TEXT_ID = "1";
  const names: Readonly<Record<string, string>> = { [NAME_TEXT_ID]: "Test Item" };
  const materialDataMap = new Map<number, MaterialData>([
    [
      ITEM_ID,
      { id: ITEM_ID, materialType: MaterialType.Exchange, nameTextId: NAME_TEXT_ID, rank: 1, rarity: 1, stackLimit: 5 },
    ],
  ]);
  const ITEM_DEFINITION = {
    category: ItemCategory.Material,
    id: ITEM_ID,
    name: "Test Item",
    rank: 1,
    rarity: 1,
    stackLimit: 5,
  };
  const FRIENDSHIP_LEVELS: FriendshipLevel[] = [
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
  const wallet = { ...EMPTY_WALLET, [Currency.Mora]: STARTING_MORA };

  test("a claim sends its Mora, items and Companionship EXP where they are kept", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID]);
    const characters = [{ ...CHARACTER, id: TRAVELER_CHARACTER_ID }, CHARACTER];
    const items = [
      { count: MORA_COUNT, id: MORA_ITEM_ID },
      { count: ITEM_COUNT, id: ITEM_ID },
      { count: ADVENTURE_EXP, id: ADVENTURE_EXP_ITEM_ID },
      { count: COMPANIONSHIP_EXP, id: COMPANIONSHIP_EXP_ITEM_ID },
    ];

    expect(
      routeCommissionClaim(
        adventureRankTables,
        0,
        characters,
        items,
        noQuest,
        FRIENDSHIP_LEVELS,
        EMPTY_INVENTORY,
        materialDataMap,
        names,
        party,
        wallet,
      ),
    ).toStrictEqual({
      adventureExp: ADVENTURE_EXP,
      characters: [
        { ...CHARACTER, id: TRAVELER_CHARACTER_ID },
        { ...CHARACTER, friendshipExp: COMPANIONSHIP_EXP },
      ],
      inventory: { items: [{ definition: ITEM_DEFINITION, id: 0, quantity: ITEM_COUNT }], nextId: 1 },
      wallet: { ...wallet, [Currency.Mora]: STARTING_MORA + MORA_COUNT },
    });
  });

  test("a claim whose bag cannot hold an item is refused whole, and routes none of its Mora or EXP", () => {
    expect.hasAssertions();

    const party = createParty([TRAVELER_CHARACTER_ID, FIRST_CHARACTER_ID]);
    const fullInventory: Inventory = {
      items: [{ definition: ITEM_DEFINITION, id: 0, quantity: ITEM_DEFINITION.stackLimit }],
      nextId: 1,
      quickSwapItemIds: [],
    };
    const items = [
      { count: MORA_COUNT, id: MORA_ITEM_ID },
      { count: ITEM_COUNT, id: ITEM_ID },
      { count: ADVENTURE_EXP, id: ADVENTURE_EXP_ITEM_ID },
    ];

    expect(
      routeCommissionClaim(
        adventureRankTables,
        0,
        [CHARACTER],
        items,
        noQuest,
        FRIENDSHIP_LEVELS,
        fullInventory,
        materialDataMap,
        names,
        party,
        wallet,
      ),
    ).toBeUndefined();
  });
});
