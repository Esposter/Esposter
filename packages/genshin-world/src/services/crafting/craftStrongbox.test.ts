import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { craftStrongbox } from "#src/services/crafting/craftStrongbox";
import { rollStrongboxArtifact } from "#src/services/crafting/rollStrongboxArtifact";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { describe, expect, test } from "vitest";

// Made-up set of five-star pieces, one per slot with three starting minor affixes, and the strongbox that holds them
const SET_ID = 10_030;
const RARITY = 5;
const SLOTS = Object.values(ArtifactSlot);
const PIECES: ReliquaryPieceData[] = SLOTS.map((slot, slotIndex) => ({
  itemId: 100_000 + slotIndex,
  nameTextId: "TEST_PIECE",
  rank: 10,
  rarity: RARITY,
  slot,
  startingMinorCount: 3,
}));
const reliquaryPieceEntryMap = new Map<number, ReliquaryPieceEntry>(
  PIECES.map((piece) => [piece.itemId, { ...piece, setId: SET_ID }]),
);
const STRONGBOX: CraftingStrongboxData = {
  id: SET_ID,
  nameTextId: "TEST_STRONGBOX",
  needCount: 3,
  pieceItemIds: PIECES.map((piece) => piece.itemId),
  rarity: RARITY,
};
const RARITY_DATA: ArtifactRarityData = {
  affixLevels: [],
  baseExperience: 1,
  levelExperiences: [100],
  maxLevel: 0,
  minorAffixGroups: [
    { attribute: Attribute.Attack, values: [10] },
    { attribute: Attribute.Defense, values: [20] },
    { attribute: Attribute.ElementalMastery, values: [30] },
    { attribute: Attribute.EnergyRecharge, values: [40] },
    { attribute: Attribute.CriticalRate, values: [50] },
  ],
  rarity: RARITY,
};
const MAIN_AFFIX_POOLS: ArtifactMainAffixPool[] = [
  { attributes: [Attribute.CriticalRate], slot: ArtifactSlot.CircletOfLogos },
  { attributes: [Attribute.Health], slot: ArtifactSlot.FlowerOfLife },
  { attributes: [Attribute.PhysicalDamageBonus], slot: ArtifactSlot.GobletOfEonothem },
  { attributes: [Attribute.Attack], slot: ArtifactSlot.PlumeOfDeath },
  { attributes: [Attribute.ElementalMastery], slot: ArtifactSlot.SandsOfEon },
];
const TABLES: ArtifactDropTables = {
  artifactMainAffixPools: MAIN_AFFIX_POOLS,
  artifactRarityDataMap: new Map([[RARITY, RARITY_DATA]]),
  reliquarySets: [{ id: SET_ID, nameTextId: "TEST_SET", needCounts: [2, 4], pieces: PIECES }],
};
const NAMES = { TEST_PIECE: "Test Piece" };
const RANDOM = (): number => 0.5;
const createArtifact = (isLocked: boolean): Artifact => ({
  experience: 0,
  isLocked,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: RARITY,
  setId: SET_ID,
  slot: ArtifactSlot.FlowerOfLife,
});
const createBagItem = (id: number, isLocked = false): InventoryItem => ({
  artifact: createArtifact(isLocked),
  definition: getDroppedItemDefinition(PIECES[0]?.itemId ?? 0, NAMES, new Map(), new Map(), reliquaryPieceEntryMap),
  id,
  quantity: 1,
});
const createCraftTables = () => ({
  artifactDropTables: TABLES,
  materialDataMap: new Map(),
  names: NAMES,
  random: RANDOM,
  reliquaryPieceEntryMap,
  weaponDataMap: new Map(),
});

describe(craftStrongbox, () => {
  test("three unlocked five-star artifacts become one strongbox artifact in the bag", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [createBagItem(0), createBagItem(1), createBagItem(2)],
      nextId: 3,
      quickSwapItemIds: [],
    };
    const expected = rollStrongboxArtifact(STRONGBOX, RANDOM, TABLES);

    expect(craftStrongbox(inventory, EMPTY_WALLET, STRONGBOX, [0, 1, 2], createCraftTables())).toStrictEqual({
      inventory: {
        items: [
          {
            artifact: expected.artifact,
            definition: getDroppedItemDefinition(expected.itemId, NAMES, new Map(), new Map(), reliquaryPieceEntryMap),
            id: 3,
            quantity: 1,
          },
        ],
        nextId: 4,
        quickSwapItemIds: [],
      },
      overflow: 0,
      wallet: EMPTY_WALLET,
    });
  });

  test("a locked artifact is not offered", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [createBagItem(0), createBagItem(1), createBagItem(2, true)],
      nextId: 3,
      quickSwapItemIds: [],
    };

    expect(craftStrongbox(inventory, EMPTY_WALLET, STRONGBOX, [0, 1, 2], createCraftTables())).toBeUndefined();
  });

  test("a choice of other than three artifacts is refused", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [createBagItem(0), createBagItem(1), createBagItem(2)],
      nextId: 3,
      quickSwapItemIds: [],
    };

    expect(craftStrongbox(inventory, EMPTY_WALLET, STRONGBOX, [0, 1], createCraftTables())).toBeUndefined();
  });
});
