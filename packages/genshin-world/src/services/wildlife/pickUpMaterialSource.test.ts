import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { MaterialSourcePlace } from "#src/models/wildlife/MaterialSourcePlace";

import { MaterialType } from "#src/models/inventory/MaterialType";
import { EMPTY_INVENTORY } from "#src/services/inventory/constants";
import { MaterialTypeItemCategoryMap } from "#src/services/inventory/MaterialTypeItemCategoryMap";
import { pickUpMaterialSource } from "#src/services/wildlife/pickUpMaterialSource";
import { itemRooms } from "#src/store/itemRooms.fixture";
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

  test.each([
    {
      itemId: ITEM_ID,
      materialSources: [otherCrystalfly],
      name: "Test Crystalfly",
      pickedId: crystalfly.id,
      sources: [crystalfly, otherCrystalfly],
    },
    {
      itemId: CRITTER_ITEM_ID,
      materialSources: [crystalfly],
      name: "Test Critter",
      pickedId: critter.id,
      sources: [critter, crystalfly],
    },
  ])("a picked $name gives its item and vanishes", ({ itemId, materialSources, name, pickedId, sources }) => {
    expect.hasAssertions();

    const pickUp = pickUpMaterialSource(sources, pickedId, EMPTY_INVENTORY, names, materialDataMap, itemRooms);

    expect(pickUp.inventory).toStrictEqual({
      items: [
        {
          definition: {
            category: MaterialTypeItemCategoryMap[MaterialType.Exchange],
            id: itemId,
            name,
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
    });
    expect(pickUp.overflow).toBe(0);
    expect(pickUp.materialSources).toStrictEqual(materialSources);
  });
});
