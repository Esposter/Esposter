import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { CurrencyItemIdMap, EMPTY_WALLET } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { payOfferingLevels } from "#src/services/offering/payOfferingLevels";
import { describe, expect, test } from "vitest";

describe(payOfferingLevels, () => {
  const ADVENTURE_EXP_COUNT = 2;
  const PRIMOGEM_COUNT = 3;
  const SIGIL_ITEM_ID = 1;
  const SIGIL_COUNT = 4;
  const STONE_ITEM_ID = 2;
  const names = { SIGIL: "Sigil", STONE: "Stone" };
  const materialDataMap = new Map<number, MaterialData>([
    [
      SIGIL_ITEM_ID,
      {
        id: SIGIL_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: "SIGIL",
        rank: 1,
        rarity: 1,
        stackLimit: 10,
      },
    ],
    [
      STONE_ITEM_ID,
      {
        id: STONE_ITEM_ID,
        materialType: MaterialType.Exchange,
        nameTextId: "STONE",
        rank: 1,
        rarity: 1,
        stackLimit: 10,
      },
    ],
  ]);
  const emptyInventory: Inventory = { items: [], nextId: 0, quickSwapItemIds: [] };

  test("every region's level pays Adventure EXP, Primogems and Sigils", () => {
    expect.hasAssertions();
    const gainedLevels: OfferingLevel[] = [
      {
        items: [{ itemCount: 1, itemId: SIGIL_ITEM_ID }],
        level: 2,
        rewards: [
          { itemCount: ADVENTURE_EXP_COUNT, itemId: ADVENTURE_EXP_ITEM_ID },
          { itemCount: PRIMOGEM_COUNT, itemId: CurrencyItemIdMap[Currency.Primogem] },
          { itemCount: SIGIL_COUNT, itemId: SIGIL_ITEM_ID },
        ],
      },
    ];

    expect(payOfferingLevels(gainedLevels, emptyInventory, EMPTY_WALLET, names, materialDataMap)).toStrictEqual({
      adventureExp: ADVENTURE_EXP_COUNT,
      inventory: {
        items: [{ definition: getItemDefinition(SIGIL_ITEM_ID, names, materialDataMap), id: 0, quantity: SIGIL_COUNT }],
        nextId: 1,
        quickSwapItemIds: [],
      },
      overflowItems: [],
      wallet: { ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT },
    });
  });

  test("liyue's level also pays its Stones of Remembrance", () => {
    expect.hasAssertions();
    const gainedLevels: OfferingLevel[] = [
      {
        items: [{ itemCount: 1, itemId: SIGIL_ITEM_ID }],
        level: 3,
        rewards: [{ itemCount: 1, itemId: STONE_ITEM_ID }],
      },
    ];

    expect(payOfferingLevels(gainedLevels, emptyInventory, EMPTY_WALLET, names, materialDataMap)).toStrictEqual({
      adventureExp: 0,
      inventory: {
        items: [{ definition: getItemDefinition(STONE_ITEM_ID, names, materialDataMap), id: 0, quantity: 1 }],
        nextId: 1,
        quickSwapItemIds: [],
      },
      overflowItems: [],
      wallet: EMPTY_WALLET,
    });
  });
});
