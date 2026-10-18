import type { Element } from "#src/models/Element";

// A card on the field the duel tracks by its state: the card it is, the usages it has left (0 where the card has no
// Usage limit), the rounds it lasts (0 where it has none), a counter the card keeps for itself (Pigeons, say), the
// Element it has been converted to, where its card can be converted (Large Wind Spirit's Swirl), absent until it is,
// And the Elemental Dice it has collected, where its card collects them (Liben), absent until it collects one
export interface GcgZoneCard {
  cardId: number;
  counter: number;
  element?: Element;
  elements?: Element[];
  rounds: number;
  usages: number;
}
