import type { ArtifactMainAffixPool } from "#src/models/artifact/ArtifactMainAffixPool";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { TreeArtifact } from "#src/models/domains/TreeArtifact";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { drawDomainArtifacts } from "#src/services/domains/drawDomainArtifacts";
import { describe, expect, test } from "vitest";

// A made-up set with a piece for every slot at three, four and five stars and each starting minor affix count those
// Stars start with, so every artifact drawn has its piece
const SET_ID = 10_020;
const SLOTS = Object.values(ArtifactSlot);
const SET: ReliquarySetData = {
  id: SET_ID,
  nameTextId: "TEST_SET",
  needCounts: [2, 4],
  pieces: [
    { rarity: 3, startingMinorCounts: [0, 1, 2] },
    { rarity: 4, startingMinorCounts: [2, 3] },
    { rarity: 5, startingMinorCounts: [3, 4] },
  ].flatMap(({ rarity, startingMinorCounts }) =>
    SLOTS.flatMap((slot, slotIndex) =>
      startingMinorCounts.map((startingMinorCount) => ({
        itemId: SET_ID * 1000 + rarity * 100 + slotIndex * 10 + startingMinorCount,
        nameTextId: "TEST_PIECE",
        rank: 1,
        rarity,
        slot,
        startingMinorCount,
      })),
    ),
  ),
};
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
    { attribute: Attribute.Health, values: [30] },
    { attribute: Attribute.EnergyRecharge, values: [40] },
    { attribute: Attribute.ElementalMastery, values: [50] },
  ],
  rarity: 3,
};
const TABLES = {
  artifactMainAffixPools: MAIN_AFFIX_POOLS,
  artifactRarityDataMap: new Map([
    [3, RARITY_DATA],
    [4, { ...RARITY_DATA, rarity: 4 }],
    [5, { ...RARITY_DATA, rarity: 5 }],
  ]),
};
const TREE_ARTIFACTS: TreeArtifact[] = [{ chance: 0.5, guaranteedCount: 2, rarity: 3 }];

describe(drawDomainArtifacts, () => {
  test("a domain with artifact rows and no set to draw from is refused", () => {
    expect.hasAssertions();

    expect(() => drawDomainArtifacts(TREE_ARTIFACTS, [], [SET], () => 0.5, TABLES)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: drawDomainArtifacts, has no artifact set to draw from]`,
    );
  });

  test("each artifact a claim draws is its own, from the domain's set at its row's rarity", () => {
    expect.hasAssertions();

    const artifacts = drawDomainArtifacts(TREE_ARTIFACTS, [SET_ID], [SET], () => 0.9, TABLES);
    expect(artifacts.map(({ artifact, count }) => [artifact?.rarity, artifact?.setId, count])).toStrictEqual([
      [3, SET_ID, 1],
      [3, SET_ID, 1],
    ]);
  });

  test("a claim's four- and five-star artifacts draw their pieces, as its three-star ones do", () => {
    expect.hasAssertions();

    const artifacts = drawDomainArtifacts(
      [
        { chance: 0, guaranteedCount: 1, rarity: 4 },
        { chance: 0, guaranteedCount: 1, rarity: 5 },
      ],
      [SET_ID],
      [SET],
      () => 0.9,
      TABLES,
    );
    expect(artifacts.map(({ artifact }) => artifact?.rarity)).toStrictEqual([4, 5]);
  });
});
