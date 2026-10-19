import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { getAutoAddFodders } from "#src/services/artifact/getAutoAddFodders";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

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

  // Base EXP per star, so a fodder's EXP is its star's base alone while it is unenhanced
  const artifactRarityDataMap = new Map([
    [2, createRarityData(2, 40)],
    [3, createRarityData(3, 60)],
    [4, createRarityData(4, 80)],
    [5, createRarityData(5, 100)],
  ]);
  const inventory: Inventory = {
    items: [
      createEntry(0, createArtifact({ level: 0, rarity: 5 })),
      createEntry(1, createArtifact({ isLocked: true, level: 0, rarity: 4 })),
      createEntry(2, createArtifact({ level: 0, rarity: 4 })),
      createEntry(3, createArtifact({ level: 0, rarity: 2 })),
      createEntry(4, createArtifact({ level: 0, rarity: 3 })),
    ],
    nextId: 5,
    quickSwapItemIds: [],
  };

  test("adds the unlocked artifacts up to four stars, the lowest rarity first, while the EXP is short of the top level", () => {
    expect.hasAssertions();

    expect(
      getAutoAddFodders({
        artifact: createArtifact({ level: 0, rarity: 5 }),
        artifactRarityDataMap,
        inventory,
        maxRarity: 4,
      }),
    ).toStrictEqual([3, 4, 2]);
  });

  test("stops adding once the artifact's EXP reaches its top level", () => {
    expect.hasAssertions();

    expect(
      getAutoAddFodders({
        artifact: createArtifact({ experience: 200, level: 1, rarity: 5 }),
        artifactRarityDataMap,
        inventory,
        maxRarity: 4,
      }),
    ).toStrictEqual([3, 4]);
  });
});
