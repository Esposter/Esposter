import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { MaterialData } from "#src/models/inventory/MaterialData";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { computeInventoryTab } from "#src/services/inventory/computeInventoryTab";
import { toItemDefinition } from "#src/services/inventory/toItemDefinition";
import { InventorySort, ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(toItemDefinition, () => {
  test("a gadget appears in the gadget tab", () => {
    expect.hasAssertions();

    const gadgetMaterial: MaterialData = {
      id: 220011,
      materialType: MaterialType.Widget,
      nameTextId: "5",
      rank: 1,
      rarity: 1,
      stackLimit: 1,
    };
    const gadget: InventoryItem = {
      definition: toItemDefinition(gadgetMaterial, { 5: "Treasure Compass" }),
      id: 1,
      quantity: 1,
    };

    expect(
      computeInventoryTab([gadget], ItemCategory.Gadget, { isDescending: true, sort: InventorySort.Level }),
    ).toStrictEqual([gadget]);
  });
});
