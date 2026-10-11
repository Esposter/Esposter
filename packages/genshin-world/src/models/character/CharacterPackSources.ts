import type { AccountCharacterPack } from "#src/models/character/AccountCharacterPack";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";

// Where the world can read a character's pack from: the packs the browser keeps, by their characters' ids, once its
// Store has opened, then the player's account's packs and where its files are served, given while the player is signed
// In, then the host the app hands the world and the ids its index lists
export interface CharacterPackSources {
  accountCharacterPacks: readonly AccountCharacterPack[];
  accountFileBaseUrl?: string;
  characterIdPackHashMap: ReadonlyMap<number, string>;
  characterPackBaseUrl?: string;
  characterPackStore?: CharacterPackStore;
  hostCharacterPackIds: ReadonlySet<number>;
}
