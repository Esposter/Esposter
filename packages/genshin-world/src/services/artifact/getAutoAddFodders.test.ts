import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { getAutoAddFodders } from "#src/services/artifact/getAutoAddFodders";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const LEVEL_EXPERIENCE = 100;
const MAX_LEVEL = 3;

const createRarityData = (rarity: number, baseExperience: number): ArtifactRarityData => ({
  affixLevels: [],
  baseExperience,
  levelExperiences: Array.from({ length: MAX_LEVEL }, () => LEVEL_EXPERIENCE),
  maxLevel: MAX_LEVEL,
  minorAffixGroups: [],
  rarity,
});

const createArtifact = (rarity: number, level: number, experience = 0, isLocked = false): Artifact => ({
  experience,
  isLocked,
  level,
  mainAffix: Attribute.Attack,
  minorAffixes: [],
  rarity,
  setId: 1,
  slot: ArtifactSlot.PlumeOfDeath,
});

const createEntry = (id: number, artifact: Artifact): InventoryItem => ({
  artifact,
  definition: {
    category: ItemCategory.Artifact,
    id: 101,
    name: "Plume Piece",
    rank: 1,
    rarity: artifact.rarity,
    stackLimit: 1,
  },
  id,
  quantity: 1,
});

describe(getAutoAddFodders, () => {
  // Base EXP per star, so a fodder's EXP is its star's base alone while it is unenhanced
  const artifactRarityDataMap = new Map([
    [2, createRarityData(2, 40)],
    [3, createRarityData(3, 60)],
    [4, createRarityData(4, 80)],
    [5, createRarityData(5, 100)],
  ]);
  const inventory: Inventory = {
    items: [
      createEntry(0, createArtifact(5, 0)),
      createEntry(1, createArtifact(4, 0, 0, true)),
      createEntry(2, createArtifact(4, 0)),
      createEntry(3, createArtifact(2, 0)),
      createEntry(4, createArtifact(3, 0)),
    ],
    nextId: 5,
    quickSwapItemIds: [],
  };

  test("adds the unlocked artifacts up to four stars, the lowest rarity first, while the EXP is short of the top level", () => {
    expect.hasAssertions();

    expect(
      getAutoAddFodders({ artifact: createArtifact(5, 0), artifactRarityDataMap, inventory, maxRarity: 4 }),
    ).toStrictEqual([3, 4, 2]);
  });

  test("stops adding once the artifact's EXP reaches its top level", () => {
    expect.hasAssertions();

    expect(
      getAutoAddFodders({ artifact: createArtifact(5, 1, 200), artifactRarityDataMap, inventory, maxRarity: 4 }),
    ).toStrictEqual([3, 4]);
  });
});
