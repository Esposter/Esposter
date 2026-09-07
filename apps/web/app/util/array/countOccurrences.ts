// Insertion-ordered, so a consumer picking a maximum resolves a tie to the first-encountered value
export const countOccurrences = (values: string[]): Map<string, number> => {
  const countMap = new Map<string, number>();
  for (const value of values) countMap.set(value, (countMap.get(value) ?? 0) + 1);
  return countMap;
};
