import type { CharacterPackFile } from "#src/models/genshinCharacters/CharacterPackFile";
import type { CharacterPackManifest } from "#src/models/genshinCharacters/CharacterPackManifest";

// A character's pack read from its folder: the files it publishes, the record listing them and that record's hash, and
// The notes its publish reports
export interface CharacterPack {
  characterId: number;
  files: CharacterPackFile[];
  manifest: CharacterPackManifest;
  notes: string[];
  packHash: string;
}
