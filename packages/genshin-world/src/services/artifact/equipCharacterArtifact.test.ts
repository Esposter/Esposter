import { createArtifact } from "#src/services/artifact/createArtifact.test";
import { createCharacter } from "#src/services/artifact/createCharacter.test";
import { equipCharacterArtifact } from "#src/services/artifact/equipCharacterArtifact";
import { describe, expect, test } from "vitest";

describe(equipCharacterArtifact, () => {
  test("equipping into an empty slot displaces nothing", () => {
    expect.hasAssertions();

    const artifact = createArtifact();
    expect(equipCharacterArtifact(createCharacter([]), artifact)).toStrictEqual({
      character: createCharacter([artifact]),
      displaced: undefined,
    });
  });

  test("equipping into a worn slot returns the piece it replaces", () => {
    expect.hasAssertions();

    const worn = createArtifact({ level: 4 });
    const replacement = createArtifact({ level: 8 });
    expect(equipCharacterArtifact(createCharacter([worn]), replacement)).toStrictEqual({
      character: createCharacter([replacement]),
      displaced: worn,
    });
  });
});
