import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { getItem } from "#shared/services/dungeons/item/getItem";
import { describe, expect, test } from "vitest";

describe(getItem, () => {
  // A new game's inventory is built by giving each looked-up item its quantity, and spending one decrements it
  test("hands out a copy, so a quantity given to it never reaches the definition", () => {
    expect.hasAssertions();

    Object.assign(getItem(ItemId.Potion), { quantity: 0 });

    expect(Object.hasOwn(getItem(ItemId.Potion), "quantity")).toBe(false);
  });
});
