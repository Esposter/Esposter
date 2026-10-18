import type { Artifact } from "#src/models/artifact/Artifact";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { equipCharacterArtifact } from "#src/services/artifact/equipCharacterArtifact";
import { describe, expect, test } from "vitest";

const createArtifact = (slot: ArtifactSlot, level = 0): Artifact => ({
  experience: 0,
  isLocked: false,
  itemId: 101,
  level,
  mainAffix: Attribute.Health,
  minorAffixes: [],
  rarity: 5,
  setId: 1,
  slot,
});

describe(equipCharacterArtifact, () => {
  test("equipping into an empty slot displaces nothing", () => {
    expect.hasAssertions();

    const artifact = createArtifact(ArtifactSlot.FlowerOfLife);
    expect(equipCharacterArtifact(createCharacter([]), artifact)).toStrictEqual({
      character: createCharacter([artifact]),
      displaced: undefined,
    });
  });

  test("equipping into a worn slot returns the piece it replaces", () => {
    expect.hasAssertions();

    const worn = createArtifact(ArtifactSlot.FlowerOfLife, 4);
    const replacement = createArtifact(ArtifactSlot.FlowerOfLife, 8);
    expect(equipCharacterArtifact(createCharacter([worn]), replacement)).toStrictEqual({
      character: createCharacter([replacement]),
      displaced: worn,
    });
  });
});
