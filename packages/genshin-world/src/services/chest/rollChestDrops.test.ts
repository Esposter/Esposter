import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { ChestKind } from "#src/models/chest/ChestKind";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";
import { describe, expect, test } from "vitest";

// Made-up sets, each with a piece for every slot, star count and starting minor affix count, so every artifact drawn has a
// Piece. A piece's item id is built from its set's id, its slot's index, its stars and its starting count, so a test names
// The piece it expects
const SLOTS = Object.values(ArtifactSlot);
const createPieceItemId = (setId: number, slotIndex: number, rarity: number, minorCount: number): number =>
  setId * 100 + slotIndex * 20 + rarity * 5 + minorCount;
const createReliquarySet = (id: number): ReliquarySetData => ({
  id,
  nameTextId: `TEST_SET_${id}`,
  needCounts: [2, 4],
  pieces: SLOTS.flatMap((slot, slotIndex) =>
    [1, 2, 3].flatMap((rarity) =>
      [0, 1, 2, 3, 4].map((minorCount) => ({
        itemId: createPieceItemId(id, slotIndex, rarity, minorCount),
        nameTextId: `TEST_PIECE_${id}`,
        rank: 1,
        rarity,
        slot,
        startingMinorCount: minorCount,
      })),
    ),
  ),
});

const LOW_SET_A_ID = 10_010;
const LOW_SET_B_ID = 10_011;
const HIGH_SET_ID = 10_005;
const RELIQUARY_SETS = [LOW_SET_A_ID, LOW_SET_B_ID, HIGH_SET_ID].map((id) => createReliquarySet(id));

// Made-up stat tables, each main affix a weighted one of its slot, and each rarity's minor affixes two made-up values
const MAIN_AFFIX_POOLS: ArtifactMainAffixPool[] = [
  { attributes: [Attribute.CriticalRate], slot: ArtifactSlot.CircletOfLogos },
  { attributes: [Attribute.Health], slot: ArtifactSlot.FlowerOfLife },
  { attributes: [Attribute.PhysicalDamageBonus], slot: ArtifactSlot.GobletOfEonothem },
  { attributes: [Attribute.Attack], slot: ArtifactSlot.PlumeOfDeath },
  { attributes: [Attribute.ElementalMastery], slot: ArtifactSlot.SandsOfEon },
];
const createRarityData = (rarity: number): ArtifactRarityData => ({
  affixLevels: [],
  baseExperience: 1,
  levelExperiences: [100],
  maxLevel: 0,
  minorAffixGroups: [
    { attribute: Attribute.Attack, values: [10] },
    { attribute: Attribute.Defense, values: [20] },
  ],
  rarity,
});
const ARTIFACT_DROP_TABLES: ArtifactDropTables = {
  artifactMainAffixPools: MAIN_AFFIX_POOLS,
  artifactRarityDataMap: new Map(
    [1, 2, 3].map((rarity): [number, ArtifactRarityData] => [rarity, createRarityData(rarity)]),
  ),
  reliquarySets: RELIQUARY_SETS,
};

describe(rollChestDrops, () => {
  test("pours one weapon and one artifact of its pool, and each material's count, a material rolling none left out", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Common, () => 0, ARTIFACT_DROP_TABLES)).toStrictEqual([
      { count: 1, itemId: 11_101 },
      {
        artifact: {
          experience: 0,
          isLocked: false,
          level: 0,
          mainAffix: Attribute.CriticalRate,
          minorAffixes: [],
          rarity: 1,
          setId: LOW_SET_A_ID,
          slot: ArtifactSlot.CircletOfLogos,
        },
        count: 1,
        itemId: createPieceItemId(LOW_SET_A_ID, 0, 1, 0),
      },
      { count: 4, itemId: 104_001 },
      { count: 1, itemId: 104_002 },
    ]);
    expect(rollChestDrops(ChestKind.Common, () => 0.999, ARTIFACT_DROP_TABLES)).toStrictEqual([
      { count: 1, itemId: 15_305 },
      {
        artifact: {
          experience: 0,
          isLocked: false,
          level: 0,
          mainAffix: Attribute.ElementalMastery,
          minorAffixes: [{ attribute: Attribute.Defense, value: 20 }],
          rarity: 2,
          setId: LOW_SET_B_ID,
          slot: ArtifactSlot.SandsOfEon,
        },
        count: 1,
        itemId: createPieceItemId(LOW_SET_B_ID, SLOTS.length - 1, 2, 1),
      },
      { count: 4, itemId: 104_001 },
      { count: 3, itemId: 104_002 },
      { count: 2, itemId: 104_003 },
    ]);
  });

  test("pours a three-star artifact of a high set, with the starting minor affixes its count gives", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Precious, () => 0.999, ARTIFACT_DROP_TABLES)).toStrictEqual([
      {
        artifact: {
          experience: 0,
          isLocked: false,
          level: 0,
          mainAffix: Attribute.ElementalMastery,
          minorAffixes: [
            { attribute: Attribute.Defense, value: 20 },
            { attribute: Attribute.Attack, value: 10 },
          ],
          rarity: 3,
          setId: HIGH_SET_ID,
          slot: ArtifactSlot.SandsOfEon,
        },
        count: 1,
        itemId: createPieceItemId(HIGH_SET_ID, SLOTS.length - 1, 3, 2),
      },
      { count: 1, itemId: 104_002 },
      { count: 1, itemId: 104_003 },
    ]);
  });

  test("pours no artifact when the reliquary sets hold none of its pool's sets", () => {
    expect.hasAssertions();

    expect(
      rollChestDrops(ChestKind.Common, () => 0, {
        ...ARTIFACT_DROP_TABLES,
        reliquarySets: [createReliquarySet(HIGH_SET_ID)],
      }),
    ).toStrictEqual([
      { count: 1, itemId: 11_101 },
      { count: 4, itemId: 104_001 },
      { count: 1, itemId: 104_002 },
    ]);
  });

  test("pours nothing from a kind with no pool", () => {
    expect.hasAssertions();

    expect(rollChestDrops(ChestKind.Remarkable, () => 0.999, ARTIFACT_DROP_TABLES)).toStrictEqual([]);
  });
});
