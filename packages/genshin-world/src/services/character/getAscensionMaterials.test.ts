import type { CharacterAscensionPhase } from "#src/models/character/CharacterAscensionPhase";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { getAscensionMaterials } from "#src/services/character/getAscensionMaterials";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(getAscensionMaterials, () => {
  const MATERIAL: ItemDefinition = {
    category: ItemCategory.Material,
    id: 112_044,
    name: "",
    rank: 1,
    rarity: 1,
    stackLimit: 99,
  };
  const PHASE: CharacterAscensionPhase = {
    attributeLines: [],
    coinCost: 20_000,
    costItems: [
      { count: 3, id: 112_044 },
      { count: 1, id: 104_161 },
    ],
    maxLevel: 40,
    requiredPlayerLevel: 15,
  };

  test("each material lists the count the phase takes and the count the player holds", () => {
    expect.hasAssertions();
    expect(
      getAscensionMaterials(PHASE, { items: [{ definition: MATERIAL, id: 0, quantity: 2 }], nextId: 1 }),
    ).toStrictEqual([
      { count: 3, held: 2, id: 112_044 },
      { count: 1, held: 0, id: 104_161 },
    ]);
  });

  test("a phase whose cost is not in the table yet lists no materials", () => {
    expect.hasAssertions();
    expect(getAscensionMaterials({ attributeLines: [], maxLevel: 40 }, { items: [], nextId: 1 })).toStrictEqual([]);
  });
});
