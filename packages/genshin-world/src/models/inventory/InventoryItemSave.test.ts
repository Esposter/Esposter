import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { inventoryItemSaveSchema } from "#src/models/inventory/InventoryItemSave";
import { describe, expect, test } from "vitest";

describe("inventoryItemSaveSchema", () => {
  const baseArtifactEntry = {
    artifact: {
      experience: 0,
      isLocked: false,
      itemId: 101,
      level: 0,
      mainAffix: Attribute.Health,
      minorAffixes: [],
      rarity: 5,
      setId: 1,
      slot: ArtifactSlot.FlowerOfLife,
    },
    id: 0,
    itemId: 101,
    kind: InventoryItemKind.Artifact,
    quantity: 1,
  };
  const baseWeaponEntry = { id: 0, itemId: 1, kind: InventoryItemKind.Weapon, level: 1, quantity: 1 };

  test("an artifact's entry whose item id is not its piece's is refused", () => {
    expect.hasAssertions();
    const entry = { ...baseArtifactEntry, artifact: { ...baseArtifactEntry.artifact, itemId: 102 } };

    expect(inventoryItemSaveSchema.safeParse(entry).success).toBe(false);
  });

  test("an artifact's entry holds the item id of its piece", () => {
    expect.hasAssertions();

    expect(inventoryItemSaveSchema.parse(baseArtifactEntry)).toStrictEqual(baseArtifactEntry);
  });

  test("a weapon's entry holds its level, EXP, ascension and refinement", () => {
    expect.hasAssertions();
    const weapon = { ...baseWeaponEntry, ascension: 1, experience: 2, level: 21, refinement: 3 };

    expect(inventoryItemSaveSchema.parse(weapon)).toStrictEqual(weapon);
  });

  test("a weapon's entry without its state is refused", () => {
    expect.hasAssertions();

    expect(inventoryItemSaveSchema.safeParse(baseWeaponEntry).success).toBe(false);
  });

  test("an entry saved before it had a kind is refused", () => {
    expect.hasAssertions();
    expect(inventoryItemSaveSchema.safeParse({ id: 0, itemId: 1, level: 1, quantity: 1 }).success).toBe(false);
  });

  test("a stack's entry holds no level", () => {
    expect.hasAssertions();
    const stack = { id: 0, itemId: 1, kind: InventoryItemKind.Stack, quantity: 2 };

    expect(inventoryItemSaveSchema.parse(stack)).toStrictEqual(stack);
  });
});
