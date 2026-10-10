import type { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";

import { CHARACTER_PACK_IMAGE_SIGNATURES } from "#src/services/genshinCharacters/constants";

// The image a texture's bytes hold, by the signature they start with, as a browser decodes it whatever its name says:
// Undefined for any other bytes, a TGA's or a DDS's among them, which no browser decodes
export const getCharacterPackImageType = (bytes: Uint8Array): CharacterPackContentType | undefined =>
  CHARACTER_PACK_IMAGE_SIGNATURES.find(({ offset, signature }) =>
    signature.every((byte, index) => bytes[offset + index] === byte),
  )?.contentType;
