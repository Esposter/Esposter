export const computeTopFrequencies = (countMap: ReadonlyMap<string, number>): readonly (readonly [string, number])[] =>
  [...countMap].toSorted(([, countA], [, countB]) => countB - countA).slice(0, 10);
