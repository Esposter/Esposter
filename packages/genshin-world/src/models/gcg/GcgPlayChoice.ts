// The choice the duel screen gives a card as it is played, for a card that takes one: the dice each reroll it makes
// Selects in the order the card makes them
export interface GcgPlayChoice {
  rerollDiceIndices?: number[][];
}
