import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { unequipCharacterArtifact } from "#src/services/artifact/unequipCharacterArtifact";
import { describe, expect, test } from "vitest";

describe(unequipCharacterArtifact, () => {
  const artifact = createArtifact();
  const character = createCharacter([artifact]);

  test("unequipping returns the worn artifact and leaves its slot empty", () => {
    expect.hasAssertions();

    expect(unequipCharacterArtifact(character, ArtifactSlot.FlowerOfLife)).toStrictEqual({
      artifact,
      character: createCharacter([]),
    });
  });

  test("unequipping an empty slot is refused", () => {
    expect.hasAssertions();

    expect(() => unequipCharacterArtifact(character, ArtifactSlot.PlumeOfDeath)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: unequipCharacterArtifact, no artifact in EQUIP_NECKLACE]`,
    );
  });
});
