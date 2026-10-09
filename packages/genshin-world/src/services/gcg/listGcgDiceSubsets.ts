// Every way of choosing dice out of the dice a side holds, from none up to all of them, each as the indices of the dice
// Chosen in order: the choices a bot tries when it does not know which dice a card or skill will take
export const listGcgDiceSubsets = (totalDice: number): number[][] => {
  const subsets: number[][] = [];
  const extend = (startIndex: number, subset: number[]): void => {
    subsets.push(subset);
    for (let index = startIndex; index < totalDice; index++) extend(index + 1, [...subset, index]);
  };
  extend(0, []);
  return subsets.toSorted((first, second) => first.length - second.length);
};
