import type { InventoryItem } from "#src/models/inventory/InventoryItem";

import { Currency } from "#src/models/inventory/Currency";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { CONDENSED_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { EMPTY_WALLET } from "#src/services/inventory/constants";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { computeBlossomClaimPrompt } from "#src/services/originalResin/computeBlossomClaimPrompt";
import { FRAGILE_RESIN_ITEM_ID } from "#src/services/originalResin/constants";
import { refillOriginalResinWithFragileResin } from "#src/services/originalResin/refillOriginalResinWithFragileResin";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const material = (id: number, quantity: number, itemId: number): InventoryItem => ({
  definition: { category: ItemCategory.Material, id, name: "", rank: 0, rarity: 0, stackLimit: 2000 },
  id: itemId,
  quantity,
});

describe(computeBlossomClaimPrompt, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const leyLinePrice = BlossomClaimResinMap[BlossomKind.LeyLine];

  test("pressing F at a cleared challenge's blossom offers its claims", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: leyLinePrice * 2 };
    const inventory = { items: [material(CONDENSED_RESIN_ITEM_ID, 1, 1)], nextId: 2 };

    // The Original Resin covers one claim and two, and the held Condensed Resin the three-claim offer, with no restore
    expect(computeBlossomClaimPrompt(BlossomKind.LeyLine, 0, wallet, inventory, epoch)).toStrictEqual({
      canRestore: false,
      offers: [
        { claimCount: 1, condensedResinCount: 0, resin: leyLinePrice },
        { claimCount: 2, condensedResinCount: 0, resin: leyLinePrice * 2 },
        { claimCount: 3, condensedResinCount: 1, resin: 0 },
      ],
    });
  });

  test("a short Original Resin offers the restore, and the claims again once a Fragile Resin restores it", () => {
    expect.hasAssertions();

    const wallet = { ...EMPTY_WALLET, [Currency.OriginalResin]: 0 };
    const inventory = { items: [material(FRAGILE_RESIN_ITEM_ID, 1, 1)], nextId: 2 };

    expect(computeBlossomClaimPrompt(BlossomKind.LeyLine, 0, wallet, inventory, epoch)).toStrictEqual({
      canRestore: true,
      offers: [],
    });

    const restored = refillOriginalResinWithFragileResin(inventory, wallet, epoch);
    expect(restored).toBeDefined();
    if (restored === undefined) return;
    const prompt = computeBlossomClaimPrompt(BlossomKind.LeyLine, 0, restored.wallet, restored.inventory, epoch);

    expect(prompt.canRestore).toBe(false);
    expect(prompt.offers).toContainEqual({ claimCount: 1, condensedResinCount: 0, resin: leyLinePrice });
  });
});
