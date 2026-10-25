export const countBy = (keys: readonly string[]): Map<string, number> => {
  const countMap = new Map<string, number>();
  for (const key of keys) countMap.set(key, (countMap.get(key) ?? 0) + 1);
  return countMap;
};
