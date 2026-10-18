import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";

import { ItemCategory } from "genshin-interface";
import { describe } from "vitest";

// The bag's definition of the five-star flower piece the artifact suites hold
export const FLOWER_ITEM_DEFINITION: ItemDefinition = {
  category: ItemCategory.Artifact,
  id: 101,
  name: "Flower Piece",
  rank: 1,
  rarity: 5,
  stackLimit: 1,
};

describe.todo("constants");
