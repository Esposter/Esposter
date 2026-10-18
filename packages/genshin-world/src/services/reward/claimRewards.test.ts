import type { MaterialData } from "#src/models/inventory/MaterialData";

import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { claimRewards } from "#src/services/reward/claimRewards";
import { describe, expect, test } from "vitest";

describe(claimRewards, () => {
  const REWARD_ID = 1;
  const MISSING_REWARD_ID = 2;
  const MATERIAL_ID = 3;
  const MATERIAL_NAME_TEXT_ID = "4";
  const MATERIAL_STACK_LIMIT = 2;
  const PRIMOGEM_COUNT = 5;
  const MORA_COUNT = 6;
  const PRIMOGEM_ITEM_ID = CurrencyItemIdMap[Currency.Primogem];
  const names = { [MATERIAL_NAME_TEXT_ID]: "Made-up Ore" };
  const materialDataMap = new Map<number, MaterialData>([
    [
      MATERIAL_ID,
      {
        id: MATERIAL_ID,
        materialType: MaterialType.Exchange,
        nameTextId: MATERIAL_NAME_TEXT_ID,
        rank: 1,
        rarity: 1,
        stackLimit: MATERIAL_STACK_LIMIT,
      },
    ],
  ]);
  const definition = getItemDefinition(MATERIAL_ID, names, materialDataMap);

  test("primogems and Mora from a reward go to the wallet", () => {
    expect.hasAssertions();

    expect(
      claimRewards(
        [REWARD_ID],
        {
          [REWARD_ID]: [
            { count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID },
            { count: MORA_COUNT, itemId: MORA_ITEM_ID },
          ],
        },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        names,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: EMPTY_INVENTORY,
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: MORA_COUNT, [Currency.Primogem]: PRIMOGEM_COUNT },
    });
  });

  test("a material from a reward goes into the bag", () => {
    expect.hasAssertions();

    expect(
      claimRewards(
        [REWARD_ID],
        { [REWARD_ID]: [{ count: 1, itemId: MATERIAL_ID }] },
        EMPTY_INVENTORY,
        EMPTY_WALLET,
        names,
        materialDataMap,
      ),
    ).toStrictEqual({
      inventory: { items: [{ definition, id: 0, quantity: 1 }], nextId: 1, quickSwapItemIds: [] },
      wallet: EMPTY_WALLET,
    });
  });

  test("a claim is refused whole when the bag has no room", () => {
    expect.hasAssertions();

    const { inventory: fullInventory } = addInventoryItem(EMPTY_INVENTORY, definition, MATERIAL_STACK_LIMIT);

    expect(
      claimRewards(
        [REWARD_ID],
        {
          [REWARD_ID]: [
            { count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID },
            { count: 1, itemId: MATERIAL_ID },
          ],
        },
        fullInventory,
        EMPTY_WALLET,
        names,
        materialDataMap,
      ),
    ).toBeUndefined();
  });

  test("a reward the record holds no items for is refused", () => {
    expect.hasAssertions();

    expect(() =>
      claimRewards([MISSING_REWARD_ID], {}, EMPTY_INVENTORY, EMPTY_WALLET, names, materialDataMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 2, names no items in the rewards record]`,
    );
  });
});
