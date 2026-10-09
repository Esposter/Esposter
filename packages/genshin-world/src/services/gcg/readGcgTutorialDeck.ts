import type { GcgDeck } from "#src/models/gcg/GcgDeck";

import { gcgTutorialDeckSchema } from "#src/models/gcg/gcgTutorialDeckSchema";

// The tutorial deck, its slice imported on demand when a duel is set up with it: its three characters, its cards in full, and
// The card ids it holds, a card once per copy
export const readGcgTutorialDeck = async (): Promise<GcgDeck> => {
  const { default: tutorialDeck } = await import("#src/generated/gcg/tutorialDeck.json");
  const parsedDeck = gcgTutorialDeckSchema.parse(tutorialDeck);
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
