import type { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";

// One file of a pack as it is published: its path in the pack, as the world requests it, its bytes as the pack holds
// Them and their sha256, its type, and whether it is stored as a zstd frame the browser decodes
export interface CharacterPackFile {
  body: Buffer;
  contentType: CharacterPackContentType;
  hash: string;
  isCompressed: boolean;
  path: string;
}
