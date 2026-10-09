import type { GcgDeck } from "#src/models/gcg/GcgDeck";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { GcgAura } from "#src/models/gcg/GcgAura";
import { GCG_STARTING_HAND_COUNT } from "#src/services/gcg/constants";
import { shuffleGcgCards } from "#src/services/gcg/shuffleGcgCards";

// A side as a duel opens it: its characters at full HP with the first one active once it prepares, its cards shuffled
// Into the draw pile, and the starting hand drawn from its top
export const createGcgSideState = (deck: GcgDeck, random: () => number): GcgSideState => {
  const drawPile = shuffleGcgCards(deck.cardIds, random);
  return {
    activeIndex: 0,
    characters: deck.characters.map((character) => ({
      aura: GcgAura.None,
      character,
      energy: 0,
      hp: character.hp,
      isFrozen: false,
      shield: 0,
    })),
    dice: [],
    drawPile: drawPile.slice(GCG_STARTING_HAND_COUNT),
    hand: drawPile.slice(0, GCG_STARTING_HAND_COUNT),
    hasDeclaredEnd: false,
    hasPrepared: false,
    hasRolled: false,
    isReplacementPending: false,
  };
};
