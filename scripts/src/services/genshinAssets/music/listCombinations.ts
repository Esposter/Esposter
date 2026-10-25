// Every combination of one candidate per voice, from `[]` up
export const listCombinations = (counts: number[]): number[][] =>
  counts.reduce<number[][]>(
    (combinations, count) =>
      combinations.flatMap((combination) => Array.from({ length: count }, (_value, index) => [...combination, index])),
    [[]],
  );
