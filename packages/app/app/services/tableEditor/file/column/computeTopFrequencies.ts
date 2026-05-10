export const computeTopFrequencies = (strings: string[]): readonly (readonly [string, number])[] => {
  const countMap = new Map<string, number>();
  for (const value of strings) countMap.set(value, (countMap.get(value) ?? 0) + 1);
  return [...countMap.entries()].toSorted(([, countA], [, countB]) => countB - countA).slice(0, 10);
};
