import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { FRAGILE_RESIN_ITEM_ID, FRAGILE_RESIN_RESTORE } from "#src/services/originalResin/constants";
import { readResinParam } from "#src/services/originalResin/readResinParam";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const resinParam = await readResinParam(GAME_DATA_LOCAL_BASE_URL);

describe(refillOriginalResinWithFragileResin, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const fragileResinItem: InventoryItem = {
    definition: {
      category: ItemCategory.Material,
      id: FRAGILE_RESIN_ITEM_ID,
      name: "",
      rank: 0,
      rarity: 0,
      stackLimit: 2,
    },
    id: 1,
    quantity: 2,
  };
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };

  test("using Fragile Resin restores sixty Original Resin", () => {
    expect.hasAssertions();

    expect(
      refillOriginalResinWithFragileResin(
        { items: [fragileResinItem], nextId: 2, quickSwapItemIds: [] },
        wallet,
        epoch,
        resinParam,
      ),
    ).toStrictEqual({
      inventory: { items: [{ ...fragileResinItem, quantity: 1 }], nextId: 2, quickSwapItemIds: [] },
      wallet: { ...wallet, [Currency.OriginalResin]: 100 + FRAGILE_RESIN_RESTORE },
    });
  });

  test("a bag holding no Fragile Resin gives undefined, and no resin is restored", () => {
    expect.hasAssertions();

    expect(refillOriginalResinWithFragileResin(EMPTY_INVENTORY, wallet, epoch, resinParam)).toBeUndefined();
  });
});
