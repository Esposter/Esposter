import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ArtifactDropTables } from "#src/models/chest/ArtifactDropTables";
import type { CraftingStrongboxData } from "#src/models/crafting/CraftingStrongboxData";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { rollStrongboxArtifact } from "#src/services/crafting/rollStrongboxArtifact";
import { describe, expect, test } from "vitest";

describe(rollStrongboxArtifact, () => {
  // Made-up set and strongbox: each slot has a five-star piece with three starting minor affixes and one with four
  const SET_ID = 10_030;
  const RARITY = 5;
  const SLOTS = Object.values(ArtifactSlot);
  const PIECES: ReliquaryPieceData[] = SLOTS.flatMap((slot, slotIndex) =>
    [3, 4].map((startingMinorCount) => ({
      itemId: 100_000 + slotIndex * 10 + startingMinorCount,
      nameTextId: "TEST_PIECE",
      rank: 10,
      rarity: RARITY,
      slot,
      startingMinorCount,
    })),
  );
  const STRONGBOX: CraftingStrongboxData = {
    id: SET_ID,
    nameTextId: "TEST_STRONGBOX",
    needCount: 3,
    pieceItemIds: PIECES.map((piece) => piece.itemId),
    rarity: RARITY,
  };
  // Made-up stat tables: each slot's main affix is one attribute, and the rarity's minor affixes are two made-up values
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
  const TABLES: ArtifactDropTables = {
    artifactMainAffixPools: MAIN_AFFIX_POOLS,
    artifactRarityDataMap: new Map([[RARITY, RARITY_DATA]]),
    reliquarySets: [{ id: SET_ID, nameTextId: "TEST_SET", needCounts: [2, 4], pieces: PIECES }],
  };

  test("a strongbox rolls a piece of its chosen set at five stars", () => {
    expect.hasAssertions();

    // Every draw takes 0.5, which picks the sixth of the ten pieces: the Goblet with four starting minor affixes. Its minor
    // Affixes are the four groups the weights favour in turn, each at its one tier
    const { artifact } = rollStrongboxArtifact(STRONGBOX, () => 0.5, TABLES);

    expect(artifact).toStrictEqual({
      experience: 0,
      isLocked: false,
      itemId: 100_024,
      level: 0,
      mainAffix: Attribute.PhysicalDamageBonus,
      minorAffixes: [
        { attribute: Attribute.Defense, value: 20 },
        { attribute: Attribute.ElementalMastery, value: 30 },
        { attribute: Attribute.EnergyRecharge, value: 40 },
        { attribute: Attribute.Attack, value: 10 },
      ],
      rarity: RARITY,
      setId: SET_ID,
      slot: ArtifactSlot.GobletOfEonothem,
    });
  });
});
