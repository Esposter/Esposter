// The map without one key, as a new map, or the same map when the key is not in it, so a shallowRef holding it is only
// Changed when a key leaves
export const withoutMapEntry = <TKey, TValue>(map: ReadonlyMap<TKey, TValue>, key: TKey): ReadonlyMap<TKey, TValue> => {
  if (!map.has(key)) return map;
  const nextMap = new Map(map);
  nextMap.delete(key);
  return nextMap;
};
