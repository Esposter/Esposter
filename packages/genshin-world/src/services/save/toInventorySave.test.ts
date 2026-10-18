import type { Artifact } from "#src/models/artifact/Artifact";
import type { Inventory } from "#src/models/inventory/Inventory";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { InventoryItemKind } from "#src/models/inventory/InventoryItemKind";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

describe(toInventorySave, () => {
  const weaponDefinition = { category: ItemCategory.Weapon, id: 1, name: "", rank: 0, rarity: 0, stackLimit: 1 };
  const materialDefinition = { category: ItemCategory.Material, id: 2, name: "", rank: 0, rarity: 0, stackLimit: 9 };

  test("saves a weapon with its state and a stack without a level", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [
        { ascension: 1, definition: weaponDefinition, experience: 0, id: 0, level: 21, quantity: 1, refinement: 2 },
        { definition: materialDefinition, id: 1, quantity: 3 },
      ],
      nextId: 2,
      quickSwapItemIds: [],
    };

    expect(toInventorySave(inventory)).toStrictEqual({
      items: [
        {
          ascension: 1,
          experience: 0,
          id: 0,
          itemId: 1,
          kind: InventoryItemKind.Weapon,
          level: 21,
          quantity: 1,
          refinement: 2,
        },
        { id: 1, itemId: 2, kind: InventoryItemKind.Stack, quantity: 3 },
      ],
      nextId: 2,
      quickSwapItemIds: [],
    });
  });

  test("refuses a weapon whose state is missing", () => {
    expect.hasAssertions();

    const inventory: Inventory = {
      items: [{ definition: weaponDefinition, id: 0, level: 1, quantity: 1 }],
      nextId: 1,
      quickSwapItemIds: [],
    };

    expect(() => toInventorySave(inventory)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: toInventorySave, weapon 0 without its state]`,
    );
  });

  test("saves an artifact as the artifact it was rolled as", () => {
    expect.hasAssertions();

    const artifactDefinition = {
      category: ItemCategory.Artifact,
      id: 60_110,
      name: "",
      rank: 0,
      rarity: 1,
      stackLimit: 1,
    };
    const artifact: Artifact = {
      experience: 0,
      isLocked: false,
      level: 0,
      mainAffix: Attribute.Health,
      minorAffixes: [{ attribute: Attribute.Attack, value: 10 }],
      rarity: 1,
      setId: 10_010,
      slot: ArtifactSlot.FlowerOfLife,
    };
    const inventory: Inventory = {
      items: [{ artifact, definition: artifactDefinition, id: 2, quantity: 1 }],
      nextId: 3,
      quickSwapItemIds: [],
    };

    expect(toInventorySave(inventory)).toStrictEqual({
      items: [{ artifact, id: 2, itemId: 60_110, kind: InventoryItemKind.Artifact, quantity: 1 }],
      nextId: 3,
      quickSwapItemIds: [],
    });
  });

  test("refuses an artifact that holds no artifact", () => {
    expect.hasAssertions();

    const artifactDefinition = {
      category: ItemCategory.Artifact,
      id: 60_110,
      name: "",
      rank: 0,
      rarity: 1,
      stackLimit: 1,
    };
    const inventory: Inventory = {
      items: [{ definition: artifactDefinition, id: 0, quantity: 1 }],
      nextId: 1,
      quickSwapItemIds: [],
    };

    expect(() => toInventorySave(inventory)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: toInventorySave, artifact 0 without its artifact]`,
    );
  });
});
