import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongbox } from "#src/models/crafting/CraftingStrongbox";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";
import type { ReliquaryPieceEntry } from "#src/models/reliquary/ReliquaryPieceEntry";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { getDroppedItemDefinition } from "#src/services/inventory/getDroppedItemDefinition";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// Made-up set and strongbox: one five-star piece per slot, each with three starting minor affixes
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
const names = { TEST_PIECE: "Test Piece", TEST_STRONGBOX: "Artifact Strongbox: Test Set" };
const reliquaryPieceEntryMap = new Map<number, ReliquaryPieceEntry>(
  PIECES.map((piece) => [piece.itemId, { ...piece, setId: SET_ID }]),
);
const strongbox: CraftingStrongbox = {
  id: SET_ID,
  nameTextId: "TEST_STRONGBOX",
  needCount: 3,
  pieceItemIds: PIECES.map((piece) => piece.itemId),
  rarity: RARITY,
};
// Made-up stat tables, each slot's main affix one attribute and five minor affix groups for the rarity
const MAIN_AFFIX_POOLS: ArtifactMainAffixPool[] = [
  { attributes: [Attribute.CriticalRate], slot: ArtifactSlot.CircletOfLogos },
  { attributes: [Attribute.Health], slot: ArtifactSlot.FlowerOfLife },
  { attributes: [Attribute.PhysicalDamageBonus], slot: ArtifactSlot.GobletOfEonothem },
  { attributes: [Attribute.Attack], slot: ArtifactSlot.PlumeOfDeath },
  { attributes: [Attribute.ElementalMastery], slot: ArtifactSlot.SandsOfEon },
];
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
const artifactDropTables: ArtifactDropTables = {
  artifactMainAffixPools: MAIN_AFFIX_POOLS,
  artifactRarityDataMap: new Map([[RARITY, RARITY_DATA]]),
  reliquarySets: [{ id: SET_ID, nameTextId: "TEST_SET", needCounts: [2, 4], pieces: PIECES }],
};
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
const definition = getDroppedItemDefinition(100_001, names, new Map(), new Map(), reliquaryPieceEntryMap);
const items: InventoryItem[] = [
  { artifact: createArtifact(false), definition, id: 0, quantity: 1 },
  { artifact: createArtifact(false), definition, id: 1, quantity: 1 },
  { artifact: createArtifact(false), definition, id: 2, quantity: 1 },
  { artifact: createArtifact(true), definition, id: 3, quantity: 1 },
];

export const props = {
  artifactDropTables,
  gameText: ENGLISH_GAME_TEXT,
  inventory: { items, nextId: 4 },
  materialDataMap: new Map(),
  names,
  reliquaryPieceEntryMap,
  strongboxes: [strongbox],
  wallet: EMPTY_WALLET,
  weaponDataMap: new Map(),
};
