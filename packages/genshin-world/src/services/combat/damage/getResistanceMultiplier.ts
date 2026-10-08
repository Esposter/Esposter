// What a target's resistance leaves of the damage it takes: half a negative resistance added, a resistance up to 75%
// Taken off, and past that a falling share of 1 / (4 × resistance + 1)
export const getResistanceMultiplier = (resistance: number): number => {
  if (resistance < 0) return 1 - resistance / 2;
  else if (resistance < 0.75) return 1 - resistance;
  else return 1 / (4 * resistance + 1);
};
