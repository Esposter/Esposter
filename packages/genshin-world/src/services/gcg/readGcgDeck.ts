import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { GcgDeckLoaderMap } from "#src/services/gcg/GcgDeckLoaderMap";
import { parseGcgDeck } from "#src/services/gcg/parseGcgDeck";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A deck's slice, imported on demand when a duel is set up with it: its characters, its cards in full, and the card ids it
// Holds, a card once per copy
export const readGcgDeck = async (deckId: number): Promise<GcgDeck> => {
  const loadDeckSlice = GcgDeckLoaderMap.get(deckId);
  if (!loadDeckSlice) throw new InvalidOperationError(Operation.Read, "deck", `no slice is written for deck ${deckId}`);
  return parseGcgDeck(await loadDeckSlice());
};
