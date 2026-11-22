export const getOrCreate = <TKey, TValue>(map: Map<TKey, TValue>, key: TKey, create: () => TValue): TValue => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Map.get answers undefined for an absent key, and `has` has just answered this one present, which the compiler cannot correlate with the get
  if (map.has(key)) return map.get(key) as TValue;

  const value = create();
  map.set(key, value);
  return value;
};
