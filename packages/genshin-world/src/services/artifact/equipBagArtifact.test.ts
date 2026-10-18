import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";
import type { InventoryItem } from "#src/models/inventory/InventoryItem";
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
  const flowerDefinition = {
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

  test("the chosen piece is worn, and the piece it wore goes back to the bag as an entry of its own", () => {
    expect.hasAssertions();

    const worn = createArtifact(0);
    const chosen = createArtifact(4);
    const other = createArtifact(2);
    expect(
      equipBagArtifact(
        { items: [createEntry(chosen, 0), createEntry(other, 1)], nextId: 2, quickSwapItemIds: [] },
        createCharacter([worn]),
        0,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([chosen]),
      inventory: { items: [createEntry(other, 1), createEntry(worn, 2)], nextId: 3, quickSwapItemIds: [] },
    });
  });

  test("a slot with no piece worn takes the chosen piece without returning one", () => {
    expect.hasAssertions();

    const chosen = createArtifact(4);
    expect(
      equipBagArtifact(
        { items: [createEntry(chosen, 0)], nextId: 1, quickSwapItemIds: [] },
        createCharacter([]),
        0,
        options,
      ),
    ).toStrictEqual({
      character: createCharacter([chosen]),
      inventory: { items: [], nextId: 1, quickSwapItemIds: [] },
    });
  });

  test("an entry that holds no artifact is refused", () => {
    expect.hasAssertions();

    expect(() =>
      equipBagArtifact(
        {
          items: [{ definition: { ...flowerDefinition, category: ItemCategory.Material }, id: 0, quantity: 3 }],
          nextId: 1,
          quickSwapItemIds: [],
        },
        createCharacter([]),
        0,
        options,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: equipBagArtifact, entry 0 is not an artifact]`,
    );
  });
});
