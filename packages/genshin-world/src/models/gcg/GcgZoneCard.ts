import type { Element } from "#src/models/Element";

// A card on the field the duel tracks by its state: the card it is, the usages it has left (0 where the card has no
// Usage limit), the rounds it lasts (0 where it has none), a counter the card keeps for itself (Pigeons, say), and the
// Element it has been converted to, where its card can be converted (Large Wind Spirit's Swirl), absent until it is
export interface GcgZoneCard {
  cardId: number;
  counter: number;
  element?: Element;
  rounds: number;
  usages: number;
}
