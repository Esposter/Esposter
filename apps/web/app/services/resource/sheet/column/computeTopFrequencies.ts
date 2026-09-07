export const computeTopFrequencies = (countMap: ReadonlyMap<string, number>): readonly (readonly [string, number])[] =>
  [...countMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, 10);
