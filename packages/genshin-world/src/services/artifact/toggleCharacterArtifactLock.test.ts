import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { toggleCharacterArtifactLock } from "#src/services/artifact/toggleCharacterArtifactLock";
import { describe, expect, test } from "vitest";

describe(toggleCharacterArtifactLock, () => {
  test("toggling a worn artifact locks it, and toggling it again unlocks it", () => {
    expect.hasAssertions();

    const character = createCharacter([createArtifact()]);
    const locked = toggleCharacterArtifactLock(character, ArtifactSlot.FlowerOfLife);
    expect(locked).toStrictEqual(createCharacter([createArtifact({ isLocked: true })]));
    expect(toggleCharacterArtifactLock(locked, ArtifactSlot.FlowerOfLife)).toStrictEqual(character);
  });

  test("toggling an empty slot is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toggleCharacterArtifactLock(createCharacter([]), ArtifactSlot.FlowerOfLife),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: toggleCharacterArtifactLock, no artifact in EQUIP_BRACER]`,
    );
  });
});
