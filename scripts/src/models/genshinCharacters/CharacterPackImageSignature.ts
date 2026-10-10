import type { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";

// The bytes an image a browser decodes starts with, at their offset into the file, and the type they mark it as
export interface CharacterPackImageSignature {
  contentType: CharacterPackContentType;
  offset: number;
  signature: readonly number[];
}
