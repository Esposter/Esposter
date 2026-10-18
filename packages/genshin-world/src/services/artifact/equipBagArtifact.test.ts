import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
import type { ItemDefinition } from "#src/models/inventory/ItemDefinition";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { equipBagArtifact } from "#src/services/artifact/equipBagArtifact";
import { ItemCategory } from "genshin-interface";
import { describe, expect, test } from "vitest";

const createArtifact = (level: number): Artifact => ({
  experience: 0,
  isLocked: false,
  level,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
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

describe(equipBagArtifact, () => {
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
  const createEntry = (artifact: Artifact, id: number): InventoryItem => ({
    artifact,
    definition: flowerDefinition,
    id,
    quantity: 1,
  });

  test("equipping a slot takes the bag's piece for it and wears it", () => {
    expect.hasAssertions();

    const artifact = createArtifact(0);
    expect(
      equipBagArtifact(
        { items: [createEntry(artifact, 0)], nextId: 1, quickSwapItemIds: [] },
        createCharacter([]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([artifact]),
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
    });
  });

  test("the piece worn in the slot goes back to the bag as an entry of its own", () => {
    expect.hasAssertions();

    const worn = createArtifact(0);
    const better = createArtifact(4);
    expect(
      equipBagArtifact(
        { items: [createEntry(better, 0)], nextId: 1, quickSwapItemIds: [] },
        createCharacter([worn]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([better]),
      inventory: { items: [createEntry(worn, 1)], nextId: 2, quickSwapItemIds: [] },
    });
  });

  test("the bag's best piece for the slot is taken, by rarity and then by level", () => {
    expect.hasAssertions();

    const lower = createArtifact(0);
    const higher = createArtifact(4);
    expect(
      equipBagArtifact(
        { items: [createEntry(lower, 0), createEntry(higher, 1)], nextId: 2, quickSwapItemIds: [] },
        createCharacter([]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([higher]),
      inventory: { items: [createEntry(lower, 0)], nextId: 2, quickSwapItemIds: [] },
    });
  });

  test("a slot the bag holds no piece for is refused", () => {
    expect.hasAssertions();

    expect(() =>
      equipBagArtifact(
        { items: [], nextId: 0, quickSwapItemIds: [] },
        createCharacter([]),
        ArtifactSlot.FlowerOfLife,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: equipBagArtifact, no artifact for EQUIP_BRACER in the bag]`,
    );
  });
});
