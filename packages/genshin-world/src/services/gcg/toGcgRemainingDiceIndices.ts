// A reroll names the dice the side has once its payment is taken: each die a group names is numbered among the dice left,
// Its index less the paid dice before it
export const toGcgRemainingDiceIndices = (diceIndexGroups: number[][], paidDiceIndices: number[]): number[][] =>
  diceIndexGroups.map((diceIndices) =>
    diceIndices.map(
      (diceIndex) => diceIndex - paidDiceIndices.filter((paidDiceIndex) => paidDiceIndex < diceIndex).length,
    ),
  );
