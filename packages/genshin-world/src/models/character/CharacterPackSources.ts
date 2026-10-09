import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";

// Where the world can read a character's pack from: the packs the browser keeps, by their characters' ids, once its
// Store has opened, then the host the app hands the world and the ids its index lists
export interface CharacterPackSources {
  characterIdPackHashMap: ReadonlyMap<number, string>;
  characterPackBaseUrl?: string;
  characterPackStore?: CharacterPackStore;
  hostCharacterPackIds: ReadonlySet<number>;
}
