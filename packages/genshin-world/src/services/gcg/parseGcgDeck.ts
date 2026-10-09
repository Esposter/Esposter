import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { gcgDeckSchema } from "#src/models/gcg/gcgDeckSchema";

// A deck's slice as a duel reads it, checked against its schema: its characters, its cards in full, and the card ids it
// Holds, a card once per copy
export const parseGcgDeck = (slice: unknown): GcgDeck => {
  const parsedDeck = gcgDeckSchema.parse(slice);
  return {
    cardIds: parsedDeck.cardIds,
    cards: parsedDeck.cards,
    characters: parsedDeck.characters.map((character) => ({
      descriptionTextId: character.descriptionTextId,
      element: character.element,
      hp: character.hp,
      id: character.id,
      maxEnergy: character.maxEnergy,
      nameTextId: character.nameTextId,
      skills: character.skills,
      weapon: character.weapon,
    })),
  };
};
