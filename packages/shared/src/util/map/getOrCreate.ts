export const getOrCreate = <TKey, TValue>(map: Map<TKey, TValue>, key: TKey, create: () => TValue): TValue => {
  const existingValue = map.get(key);
  if (existingValue !== undefined) return existingValue;

  const value = create();
  map.set(key, value);
  return value;
};
