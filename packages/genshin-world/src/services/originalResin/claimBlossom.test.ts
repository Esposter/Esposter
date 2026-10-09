import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { Currency } from "#src/models/inventory/Currency";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { claimBlossom } from "#src/services/originalResin/claimBlossom";
import { ADVENTURE_EXP_PER_RESIN } from "#src/services/originalResin/constants";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(claimBlossom, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const noQuest = new Set<string>();
  const names: Readonly<Record<string, string>> = {};
  const MORA_COUNT = 12_000;
  const RESIN = 20;
  const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 100 };

  test("a resin claim spends its resin, takes its Adventure EXP and draws its Mora into the wallet once", () => {
    expect.hasAssertions();

    expect(
      claimBlossom(
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 1, condensedResinCount: 0, resin: RESIN },
        BlossomKind.Domain,
        0,
        noQuest,
        epoch,
        names,
        () => [
          { count: MORA_COUNT, id: MORA_ITEM_ID },
          { count: 100, id: ADVENTURE_EXP_ITEM_ID },
        ],
      ),
    ).toStrictEqual({
      adventureExp: RESIN * ADVENTURE_EXP_PER_RESIN,
      inventory: EMPTY_INVENTORY,
      wallet: { ...wallet, [Currency.Mora]: MORA_COUNT, [Currency.OriginalResin]: 100 - RESIN },
    });
  });

  test("a Condensed Resin claim takes one Condensed Resin out of the bag and draws its three rewards, spending no resin", () => {
    expect.hasAssertions();

    const condensedResinItem: InventoryItem = {
      definition: {
        category: ItemCategory.Material,
        id: CONDENSED_RESIN_ITEM_ID,
        name: "",
        rank: 0,
        rarity: 0,
        stackLimit: 5,
      },
      id: 0,
      quantity: 1,
    };
    let drawCount = 0;

    expect(
      claimBlossom(
        wallet,
        { items: [condensedResinItem], nextId: 1 },
        { claimCount: 3, condensedResinCount: 1, resin: 0 },
        BlossomKind.Domain,
        0,
        noQuest,
        epoch,
        names,
        () => {
          drawCount++;
          return [];
        },
      ),
    ).toStrictEqual({ adventureExp: 0, inventory: { items: [], nextId: 1 }, wallet });
    expect(drawCount).toBe(3);
  });

  test("an offer the resin does not cover is refused, and nothing is drawn", () => {
    expect.hasAssertions();

    expect(
      claimBlossom(
        wallet,
        EMPTY_INVENTORY,
        { claimCount: 1, condensedResinCount: 0, resin: 101 },
        BlossomKind.Domain,
        0,
        noQuest,
        epoch,
        names,
        () => [],
      ),
    ).toBeUndefined();
  });
});
