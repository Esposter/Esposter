import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

// The packs the browser keeps and the index of them: a pack put in place of its character's last one, a file of a kept
// Pack read by the path the layout serves it at, and a character's pack removed. Each change returns the index after it
export interface CharacterPackStore {
  put: (characterPack: CharacterPack) => Promise<StoredCharacterPack[]>;
  readFile: (storedCharacterPack: StoredCharacterPack, path: string) => Promise<Blob>;
  readIndex: () => Promise<StoredCharacterPack[]>;
  remove: (characterId: number) => Promise<StoredCharacterPack[]>;
}
