import { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";
import { getCharacterPackImageType } from "#src/services/genshinCharacters/getCharacterPackImageType";
import { describe, expect, test } from "vitest";

describe(getCharacterPackImageType, () => {
  // WebP's signature follows its RIFF header, and a TGA has none
  test.each([
    { bytes: [0x89, 0x50, 0x4e, 0x47], expected: CharacterPackContentType.Png },
    { bytes: [0, 0, 0, 0, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], expected: CharacterPackContentType.Webp },
    { bytes: [0], expected: undefined },
  ])("reads $expected", ({ bytes, expected }) => {
    expect.hasAssertions();
    expect(getCharacterPackImageType(Uint8Array.from(bytes))).toBe(expected);
  });
});
