import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";

import { CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { decodeCharacterTerms } from "#src/services/character/decodeCharacterTerms";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// A pack's terms as the text bundled with its model, decoded as the terms file's own encoding reads.
// The terms are shown as written, since the wording differs slightly by character
export const readCharacterTerms = (
  characterPackReader: CharacterPackReader,
): ReturnType<typeof getResultAsync<string>> =>
  getResultAsync(async () => {
    const termsBlob = await characterPackReader.readFile(CHARACTER_TERMS_PATH);
    if (termsBlob === undefined)
      throw new InvalidOperationError(Operation.Read, CHARACTER_TERMS_PATH, "is no file of the pack");
    return decodeCharacterTerms(new Uint8Array(await termsBlob.arrayBuffer())).text;
  });
