import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { EMPTY_INVENTORY } from "#src/services/inventory/constants";
import { MaterialTypeItemCategoryMap } from "#src/services/inventory/MaterialTypeItemCategoryMap";
import { pickUpMaterialSource } from "#src/services/wildlife/pickUpMaterialSource";
import { describe, expect, test } from "vitest";

describe(pickUpMaterialSource, () => {
  const ITEM_ID = 1001;
  const NAME_TEXT_ID = "1";
  const CRITTER_ITEM_ID = 1002;
  const CRITTER_NAME_TEXT_ID = "2";
  const materialDataMap = new Map<number, MaterialData>([
    [
      CRITTER_ITEM_ID,
      {
        id: CRITTER_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: CRITTER_NAME_TEXT_ID,
        rank: 1,
        rarity: 1,
        stackLimit: 99,
      },
    ],
    [
      ITEM_ID,
      {
        id: ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: NAME_TEXT_ID,
        rank: 1,
        rarity: 1,
        stackLimit: 99,
      },
    ],
  ]);
  const names = { [CRITTER_NAME_TEXT_ID]: "Test Critter", [NAME_TEXT_ID]: "Test Crystalfly" };
  const crystalfly: MaterialSourcePlace = {
    id: "crystalfly",
    kind: { hasStandIn: true, itemId: ITEM_ID },
    position: { x: 1, z: 2 },
  };
  const otherCrystalfly: MaterialSourcePlace = {
    id: "other",
    kind: { hasStandIn: true, itemId: ITEM_ID },
    position: { x: 3, z: 4 },
  };
  const critter: MaterialSourcePlace = {
    id: "critter",
    kind: { hasStandIn: true, itemId: CRITTER_ITEM_ID },
    position: { x: 5, z: 6 },
  };

  test("a crystalfly picked up gives its item and vanishes", () => {
    expect.hasAssertions();

    const pickUp = pickUpMaterialSource(
      [crystalfly, otherCrystalfly],
      crystalfly.id,
      EMPTY_INVENTORY,
      names,
      materialDataMap,
    );
    const expectedInventory: Inventory = {
      items: [
        {
          definition: {
            category: MaterialTypeItemCategoryMap[MaterialType.Exchange],
            id: ITEM_ID,
            name: "Test Crystalfly",
            rank: 1,
            rarity: 1,
            stackLimit: 99,
          },
          id: 0,
          quantity: 1,
        },
      ],
      nextId: 1,
      quickSwapItemIds: [],
    };

    expect(pickUp.inventory).toStrictEqual(expectedInventory);
    expect(pickUp.overflow).toBe(0);
    expect(pickUp.materialSources).toStrictEqual([otherCrystalfly]);
  });

  test("a picked critter gives its item and vanishes", () => {
    expect.hasAssertions();

    const pickUp = pickUpMaterialSource([critter, crystalfly], critter.id, EMPTY_INVENTORY, names, materialDataMap);
    const expectedInventory: Inventory = {
      items: [
        {
          definition: {
            category: MaterialTypeItemCategoryMap[MaterialType.Exchange],
            id: CRITTER_ITEM_ID,
            name: "Test Critter",
            rank: 1,
            rarity: 1,
            stackLimit: 99,
          },
          id: 0,
          quantity: 1,
        },
      ],
      nextId: 1,
      quickSwapItemIds: [],
    };

    expect(pickUp.inventory).toStrictEqual(expectedInventory);
    expect(pickUp.overflow).toBe(0);
    expect(pickUp.materialSources).toStrictEqual([crystalfly]);
  });
});
