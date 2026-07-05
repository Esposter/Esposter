export const getOrCreate = <TKey, TValue>(map: Map<TKey, TValue>, key: TKey, create: () => TValue): TValue => {
  if (map.has(key)) return map.get(key) as TValue;

  const value = create();
  map.set(key, value);
  return value;
};
