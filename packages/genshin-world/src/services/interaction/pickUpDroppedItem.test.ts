import englishNameText from "#src/generated/nameText/English.json";
import { Currency } from "#src/models/inventory/Currency";
import { pickUpDroppedItem } from "#src/services/interaction/pickUpDroppedItem";
import { addInventoryItem } from "#src/services/inventory/addInventoryItem";
import { EMPTY_INVENTORY, EMPTY_WALLET, MORA_ITEM_ID } from "#src/services/inventory/constants";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { describe, expect, test } from "vitest";

describe(pickUpDroppedItem, () => {
  const maskId = 112_005;

  test("takes Mora into the wallet", () => {
    expect.hasAssertions();

    expect(
      pickUpDroppedItem({ count: 5, itemId: MORA_ITEM_ID }, EMPTY_INVENTORY, EMPTY_WALLET, englishNameText),
    ).toStrictEqual({ inventory: EMPTY_INVENTORY, overflow: 0, wallet: { ...EMPTY_WALLET, [Currency.Mora]: 5 } });
  });

  test("takes a material into the bag as its definition", () => {
    expect.hasAssertions();

    const definition = getItemDefinition(maskId, englishNameText);

    expect(
      pickUpDroppedItem({ count: 1, itemId: maskId }, EMPTY_INVENTORY, EMPTY_WALLET, englishNameText),
    ).toStrictEqual({
      inventory: { items: [{ definition, id: 0, quantity: 1 }], nextId: 1 },
      overflow: 0,
      wallet: EMPTY_WALLET,
    });
  });

  test("leaves what a full stack has no room for", () => {
    expect.hasAssertions();

    const definition = getItemDefinition(maskId, englishNameText);
    const { inventory } = addInventoryItem(EMPTY_INVENTORY, definition, definition.stackLimit);

    expect(pickUpDroppedItem({ count: 2, itemId: maskId }, inventory, EMPTY_WALLET, englishNameText)).toStrictEqual({
      inventory,
      overflow: 2,
      wallet: EMPTY_WALLET,
    });
  });
});
