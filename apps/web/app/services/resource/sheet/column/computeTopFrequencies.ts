// What the frequency chart has room for before its bars stop being readable
const MAX_TOP_FREQUENCIES = 10;

export const computeTopFrequencies = (countMap: ReadonlyMap<string, number>): readonly (readonly [string, number])[] =>
  [...countMap].toSorted(([, firstCount], [, secondCount]) => secondCount - firstCount).slice(0, MAX_TOP_FREQUENCIES);
