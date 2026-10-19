import type { MaterialData } from "#src/models/inventory/MaterialData";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { BlossomKind } from "#src/models/originalResin/BlossomKind";
import { claimTrounceBlossom } from "#src/services/bosses/claimTrounceBlossom";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { countInventoryItem } from "#src/services/inventory/countInventoryItem";
import { BlossomClaimResinMap } from "#src/services/originalResin/BlossomClaimResinMap";
import { describe, expect, test } from "vitest";

describe(claimTrounceBlossom, () => {
  const epoch = Temporal.Instant.fromEpochMilliseconds(0);
  const UNIQUE_DROP_ID = 9003;
  const UNIQUE_DROP_NAME_TEXT_ID = "9003";
  const names: Readonly<Record<string, string>> = { [UNIQUE_DROP_NAME_TEXT_ID]: "Test Boss Drop" };
  const RESIN_CLAIM = BlossomClaimResinMap[BlossomKind.NormalBoss];
  const materialDataMap = new Map<number, MaterialData>([
    [
      UNIQUE_DROP_ID,
      {
        id: UNIQUE_DROP_ID,
        materialType: MaterialType.Exchange,
        nameTextId: UNIQUE_DROP_NAME_TEXT_ID,
        rank: 0,
        rarity: 0,
        stackLimit: 99,
      },
    ],
  ]);

  test("a claim spends its resin and grants its Mora into the wallet and its drop into the bag", () => {
    expect.hasAssertions();

    const claim = claimTrounceBlossom(
      { ...EMPTY_WALLET, [Currency.OriginalResin]: RESIN_CLAIM + 1 },
      EMPTY_INVENTORY,
      RESIN_CLAIM,
      [
        { count: 2, id: MORA_ITEM_ID },
        { count: 1, id: UNIQUE_DROP_ID },
      ],
      epoch,
      names,
      materialDataMap,
    );

    expect(claim?.wallet[Currency.OriginalResin]).toBe(1);
    expect(claim?.wallet[Currency.Mora]).toBe(2);
    expect(countInventoryItem(claim?.inventory.items ?? [], UNIQUE_DROP_ID)).toBe(1);
  });

  test("a claim with less Original Resin than its price is refused", () => {
    expect.hasAssertions();

    expect(
      claimTrounceBlossom(
        { ...EMPTY_WALLET, [Currency.OriginalResin]: RESIN_CLAIM - 1 },
        EMPTY_INVENTORY,
        RESIN_CLAIM,
        [],
        epoch,
        names,
        materialDataMap,
      ),
    ).toBeUndefined();
  });
});
