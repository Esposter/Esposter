import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { describe, expect, test } from "vitest";

describe("inventoryItemSaveSchema", () => {
  test("a weapon's entry holds its level, EXP, ascension and refinement", () => {
    expect.hasAssertions();

    expect(
      inventoryItemSaveSchema.parse({
        ascension: 1,
        experience: 2,
        id: 0,
        itemId: 1,
        kind: InventoryItemKind.Weapon,
        level: 21,
        quantity: 1,
        refinement: 3,
      }),
    ).toStrictEqual({
      ascension: 1,
      experience: 2,
      id: 0,
      itemId: 1,
      kind: InventoryItemKind.Weapon,
      level: 21,
      quantity: 1,
      refinement: 3,
    });
  });

  test("a weapon's entry without its state is refused", () => {
    expect.hasAssertions();

    expect(
      inventoryItemSaveSchema.safeParse({ id: 0, itemId: 1, kind: InventoryItemKind.Weapon, level: 1, quantity: 1 })
        .success,
    ).toBe(false);
  });

  test("an entry saved before it had a kind is refused", () => {
    expect.hasAssertions();

    expect(inventoryItemSaveSchema.safeParse({ id: 0, itemId: 1, level: 1, quantity: 1 }).success).toBe(false);
  });

  test("a stack's entry holds no level", () => {
    expect.hasAssertions();

    expect(
      inventoryItemSaveSchema.parse({ id: 0, itemId: 1, kind: InventoryItemKind.Stack, quantity: 2 }),
    ).toStrictEqual({ id: 0, itemId: 1, kind: InventoryItemKind.Stack, quantity: 2 });
  });
});
