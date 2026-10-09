// A card on the field the duel tracks by its state: the card it is, the usages it has left (0 where the card has no
// Usage limit), the rounds it lasts (0 where it has none), and a counter the card keeps for itself (Pigeons, say)
export interface GcgZoneCard {
  cardId: number;
  counter: number;
  rounds: number;
  usages: number;
}
