import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { gcgDeckSchema } from "#src/models/gcg/gcgDeckSchema";
import { GcgDeckLoaderMap } from "#src/services/gcg/GcgDeckLoaderMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A deck's slice, imported on demand when a duel is set up with it: its characters, its cards in full, and the card ids it
// Holds, a card once per copy
export const readGcgDeck = async (deckId: number): Promise<GcgDeck> => {
  const loadDeckSlice = GcgDeckLoaderMap.get(deckId);
  if (!loadDeckSlice) throw new InvalidOperationError(Operation.Read, "deck", `no slice is written for deck ${deckId}`);
  const parsedDeck = gcgDeckSchema.parse(await loadDeckSlice());
  return {
    cardIds: parsedDeck.cardIds,
    cards: parsedDeck.cards,
    characters: parsedDeck.characters.map((character) => ({
      element: character.element,
      hp: character.hp,
      id: character.id,
      maxEnergy: character.maxEnergy,
      skills: character.skills,
      weapon: character.weapon,
    })),
  };
};
