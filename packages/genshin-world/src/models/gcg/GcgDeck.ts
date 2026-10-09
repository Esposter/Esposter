import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";

// A side's deck as a duel is set up with it: its three character cards, and its action cards by their ids
export interface GcgDeck {
  cardIds: number[];
  characters: GcgCharacter[];
}
