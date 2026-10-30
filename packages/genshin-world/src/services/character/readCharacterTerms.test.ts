import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { readCharacterTerms } from "#src/services/character/readCharacterTerms";
import { describe, expect, test } from "vitest";

describe(readCharacterTerms, () => {
  const characterId = 1;
  const termsText = "terms";

  test("terms are read from the pack's terms file as they decode", async () => {
    expect.hasAssertions();

    const characterPackReader: CharacterPackReader = {
      characterId,
      key: "",
      readFile: (path) => Promise.resolve(path === CHARACTER_TERMS_PATH ? new Blob([termsText]) : undefined),
    };

    const terms = await readCharacterTerms(characterPackReader);

    expect(
      terms.match(
        (text) => text,
        (error) => {
          throw error;
        },
      ),
    ).toBe(termsText);
  });
});
