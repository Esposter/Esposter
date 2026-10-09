import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { GcgDeckLoaderMap } from "#src/services/gcg/GcgDeckLoaderMap";
import { parseGcgDeck } from "#src/services/gcg/parseGcgDeck";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A deck's slice, fetched by its key when a duel is set up with it: its characters, its cards in full, and the card ids
// It holds, a card once per copy
export const readGcgDeck = async (gameDataBaseUrl: string, deckId: number): Promise<GcgDeck> => {
  const loadDeckSlice = GcgDeckLoaderMap.get(deckId);
  if (!loadDeckSlice) throw new InvalidOperationError(Operation.Read, "deck", `no slice is written for deck ${deckId}`);
  return parseGcgDeck(await loadDeckSlice(gameDataBaseUrl));
};
