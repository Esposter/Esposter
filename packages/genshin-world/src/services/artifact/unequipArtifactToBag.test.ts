import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquaryPieceData } from "#src/models/reliquary/ReliquaryPieceData";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { FLOWER_ITEM_DEFINITION } from "#src/services/artifact/constants.test";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { equipBagArtifact } from "#src/services/artifact/equipBagArtifact";
import { rollPieceArtifact } from "#src/services/artifact/rollPieceArtifact";
import { unequipArtifactToBag } from "#src/services/artifact/unequipArtifactToBag";
import { addDroppedItem } from "#src/services/inventory/addDroppedItem";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ItemCategory } from "genshin-interface";
import { assert, describe, expect, test } from "vitest";

describe(unequipArtifactToBag, () => {
  const variantName = "Four Affix Flower Piece";
  const variantDefinition: ItemDefinition = { ...FLOWER_ITEM_DEFINITION, id: 102, name: variantName };
  const flowerPiece = {
    itemId: 101,
    nameTextId: "101",
    rank: 1,
    rarity: 5,
    slot: ArtifactSlot.FlowerOfLife,
    startingMinorCount: 3,
  } satisfies ReliquaryPieceData;
  const variantPiece = {
    itemId: 102,
    nameTextId: "102",
    rank: 1,
    rarity: 5,
    slot: ArtifactSlot.FlowerOfLife,
    startingMinorCount: 4,
  } satisfies ReliquaryPieceData;
  const options = {
    names: { "101": "Flower Piece", "102": variantName },
    reliquarySets: [
      { id: 1, nameTextId: "1", needCounts: [2, 4], pieces: [flowerPiece, variantPiece] },
    ] satisfies ReliquarySetData[],
  };
  const rarityData: ArtifactRarityData = {
    affixLevels: [4],
    baseExperience: 100,
    levelExperiences: [50],
    maxLevel: 1,
    minorAffixGroups: [
      { attribute: Attribute.Attack, values: [1] },
      { attribute: Attribute.CriticalDamage, values: [2] },
      { attribute: Attribute.CriticalRate, values: [3] },
      { attribute: Attribute.ElementalMastery, values: [4] },
    ],
    rarity: 5,
  };

  test("unequipping puts the worn piece in the bag as an entry of its own", () => {
    expect.hasAssertions();

    const artifact = createArtifact();
    expect(
      unequipArtifactToBag(
        { items: [], nextId: 1, quickSwapItemIds: [] },
        createCharacter([artifact]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([]),
      inventory: {
        items: [{ artifact, definition: FLOWER_ITEM_DEFINITION, id: 1, quantity: 1 }],
        nextId: 2,
        quickSwapItemIds: [],
      },
      isBagFull: false,
    });
  });

  test("a dropped second variant comes back to the bag as that variant once worn and unequipped", () => {
    expect.hasAssertions();

    const dropped = rollPieceArtifact(1, variantPiece, () => 0, {
      artifactMainAffixPools: [{ attributes: [Attribute.Health], slot: ArtifactSlot.FlowerOfLife }],
      artifactRarityDataMap: new Map([[5, rarityData]]),
    });
    const { inventory } = addDroppedItem({ items: [], nextId: 0, quickSwapItemIds: [] }, dropped, variantDefinition);
    const worn = equipBagArtifact(inventory, createCharacter([]), 0, options);
    expect(unequipArtifactToBag(worn.inventory, worn.character, ArtifactSlot.FlowerOfLife, options)).toStrictEqual({
      character: createCharacter([]),
      inventory: {
        items: [{ artifact: dropped.artifact, definition: variantDefinition, id: 1, quantity: 1 }],
        nextId: 2,
        quickSwapItemIds: [],
      },
      isBagFull: false,
    });
  });

  test("unequipping keeps the gadget equipped to the quick-use slot", () => {
    expect.hasAssertions();

    const unequipped = unequipArtifactToBag(
      { equippedGadgetItemId: 1, items: [], nextId: 1, quickSwapItemIds: [] },
      createCharacter([createArtifact()]),
      ArtifactSlot.FlowerOfLife,
      options,
    );
    assert(!unequipped.isBagFull);

    expect(unequipped.inventory.equippedGadgetItemId).toBe(1);
  });

  test("unequipping with the artifacts tab full reports the full bag, and the piece stays worn", () => {
    expect.hasAssertions();

    const room = ItemCategoryRoomMap[ItemCategory.Artifact];
    assert.exists(room);
    const artifact = createArtifact();
    const items = Array.from({ length: room }, (_value, index) => ({
      artifact: createArtifact(),
      definition: FLOWER_ITEM_DEFINITION,
      id: index,
      quantity: 1,
    }));

    expect(
      unequipArtifactToBag(
        { items, nextId: room, quickSwapItemIds: [] },
        createCharacter([artifact]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toStrictEqual({ isBagFull: true });
  });

  test("unequipping an empty slot is refused", () => {
    expect.hasAssertions();

    expect(() =>
      unequipArtifactToBag(
        { items: [], nextId: 0, quickSwapItemIds: [] },
        createCharacter([]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: unequipCharacterArtifact, no artifact in EQUIP_BRACER]`,
    );
  });

  test("a worn piece of a set the tables hold no piece of is refused", () => {
    expect.hasAssertions();

    expect(() =>
      unequipArtifactToBag(
        { items: [], nextId: 0, quickSwapItemIds: [] },
        createCharacter([createArtifact({ setId: 2 })]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getArtifactItemDefinition, set 2 piece with item id 101]`,
    );
  });
});
