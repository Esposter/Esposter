import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

import englishNameText from "#src/generated/nameText/English.json";
import { Currency } from "#src/models/inventory/Currency";
import { EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { offerBagItems } from "#src/services/offering/offerBagItems";
import { describe, expect, test } from "vitest";

describe(offerBagItems, () => {
  const offeringItemId = 112_005;
  const definition = getItemDefinition(offeringItemId, englishNameText);
  const levels: OfferingLevel[] = [
    { itemCount: 0, itemId: 0, level: 1, rewards: [] },
    { itemCount: 1, itemId: offeringItemId, level: 2, rewards: [{ itemCount: 1, itemId: MORA_ITEM_ID }] },
    { itemCount: 2, itemId: offeringItemId, level: 3, rewards: [] },
  ];

  test("every offering item the bag holds is offered and taken out of it, reaching the levels it covers", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [{ definition, id: 0, quantity: 4 }];

    expect(
      offerBagItems({ items, nextId: 1 }, EMPTY_WALLET, { heldCount: 0, level: 1, levels }, englishNameText),
    ).toStrictEqual({
      inventory: { items: [], nextId: 1 },
      overflow: 0,
      progress: { heldCount: 1, level: 3, levels },
      wallet: { ...EMPTY_WALLET, [Currency.Mora]: 1 },
    });
  });

  test("items past the last level are taken out of the bag and held", () => {
    expect.hasAssertions();

    const items: InventoryItem[] = [{ definition, id: 0, quantity: 3 }];

    expect(
      offerBagItems({ items, nextId: 1 }, EMPTY_WALLET, { heldCount: 0, level: 3, levels }, englishNameText),
    ).toStrictEqual({
      inventory: { items: [], nextId: 1 },
      overflow: 0,
      progress: { heldCount: 3, level: 3, levels },
      wallet: EMPTY_WALLET,
    });
  });
});
