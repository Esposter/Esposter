import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { getResultAsync } from "@esposter/shared";

// A pack's terms are the text bundled with its model, read as written since the wording differs slightly by character,
// So the terms of each model are shown rather than a summary of them
export const readCharacterTerms = (
  characterPackReader: CharacterPackReader,
): ReturnType<typeof getResultAsync<string>> =>
  getResultAsync(async () => {
    const termsBlob = await characterPackReader.readFile(CHARACTER_TERMS_PATH);
    return termsBlob.text();
  });
