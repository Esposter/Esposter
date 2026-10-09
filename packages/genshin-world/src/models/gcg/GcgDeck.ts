import type { GcgCard } from "#src/models/gcg/GcgCard";
import type { GcgCharacter } from "#src/models/gcg/GcgCharacter";

// A side's deck as a duel is set up with it: its three character cards, its action cards by their ids (a card once per
// Copy), and the definition of each distinct card those ids name
export interface GcgDeck {
  cardIds: number[];
  cards: GcgCard[];
  characters: GcgCharacter[];
}
