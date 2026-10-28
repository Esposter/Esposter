import type { GcgDeckSliceCard } from "#src/models/genshinAssets/shared/GcgDeckSliceCard";
import type { GcgDeckSliceCharacter } from "#src/models/genshinAssets/shared/GcgDeckSliceCharacter";

// A deck's slice: its cards in order, its characters in order, and the card ids the deck holds, a card once per copy
export interface GcgDeckSlice {
  cardIds: number[];
  cards: GcgDeckSliceCard[];
  characterIds: number[];
  characters: GcgDeckSliceCharacter[];
}
