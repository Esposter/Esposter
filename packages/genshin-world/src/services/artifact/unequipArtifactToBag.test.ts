import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { unequipArtifactToBag } from "#src/services/artifact/unequipArtifactToBag";
import { ItemCategoryRoomMap } from "#src/services/inventory/ItemCategoryRoomMap";
import { ItemCategory } from "genshin-interface";
import { assert, describe, expect, test } from "vitest";

const createArtifact = (setId: number): Artifact => ({
  experience: 0,
  isLocked: false,
  level: 0,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId,
  slot: ArtifactSlot.FlowerOfLife,
});

const createCharacter = (artifacts: Artifact[]): Character => ({
  artifacts,
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id: 1,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
});

describe(unequipArtifactToBag, () => {
  const flowerDefinition: ItemDefinition = {
    category: ItemCategory.Artifact,
    id: 101,
    name: "Flower Piece",
    rank: 1,
    rarity: 5,
    stackLimit: 1,
  };
  const options = {
    names: { "101": "Flower Piece" },
    reliquarySets: [
      {
        id: 1,
        needCounts: [2, 4],
        nameTextId: "1",
        pieces: [
          {
            itemId: 101,
            nameTextId: "101",
            rank: 1,
            rarity: 5,
            slot: ArtifactSlot.FlowerOfLife,
            startingMinorCount: 3,
          },
        ],
      },
    ] satisfies ReliquarySetData[],
  };

  test("unequipping puts the worn piece in the bag as an entry of its own", () => {
    expect.hasAssertions();

    const artifact = createArtifact(1);
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
        items: [{ artifact, definition: flowerDefinition, id: 1, quantity: 1 }],
        nextId: 2,
        quickSwapItemIds: [],
      },
      isBagFull: false,
    });
  });

  test("unequipping with the artifacts tab full reports the full bag, and the piece stays worn", () => {
    expect.hasAssertions();

    const room = ItemCategoryRoomMap[ItemCategory.Artifact];
    assert.exists(room);
    const artifact = createArtifact(1);
    const items = Array.from({ length: room }, (_value, index) => ({
      artifact: createArtifact(1),
      definition: flowerDefinition,
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
        createCharacter([createArtifact(2)]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: getArtifactItemDefinition, set 2 piece for EQUIP_BRACER at rarity 5]`,
    );
  });
});
