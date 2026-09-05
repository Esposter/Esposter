export const useDataMap = <TItem>(currentId: MaybeRefOrGetter<string>, defaultValue: (() => TItem) | TItem) => {
  const dataMap: Ref<Map<string, TItem>> = ref(new Map());
  // A factory creates a fresh default per key (required for class instances, which structuredClone
  // Would strip to plain objects); a plain value is cloned so keys never share state.
  const createDefaultValue = () =>
    typeof defaultValue === "function" ? (defaultValue as () => TItem)() : structuredClone(defaultValue);
  const getData = (key: string) => dataMap.value.get(key);
  const setData = (key: string, value: TItem) => {
    dataMap.value.set(key, value);
  };
  const readDataByKey = (key: string) => {
    if (!key) return createDefaultValue();
    // Existence, not truthiness — a key holding `false`, `0` or `""` is stored data, and treating it as absent
    // Would regenerate the default over a value a caller explicitly wrote
    if (dataMap.value.has(key)) return getData(key) ?? createDefaultValue();

    const newDefaultValue = createDefaultValue();
    setData(key, newDefaultValue);
    // Return the value read back from the reactive map, not the freshly created object — the map
    // Wraps object values in a reactive proxy on read, so returning newDefaultValue directly would hand
    // Callers (and deep watchers) a non-reactive object whose later mutations never trigger reactivity.
    return getData(key) ?? newDefaultValue;
  };
  const writeDataByKey = (key: string, newData: TItem) => {
    if (!key) return;
    setData(key, newData);
  };

  // A view onto one key's slice, whichever key that is. The ambient `data` below is this bound to the current key,
  // And an operation issued for a particular key binds this to that key instead — which is what keeps a response
  // That lands after the current key moved out of the slice it is now pointing at
  const getDataRef = (key: MaybeRefOrGetter<string>): Ref<TItem> =>
    computed({
      get: () => readDataByKey(toValue(key)),
      set: (newData) => {
        writeDataByKey(toValue(key), newData);
      },
    });
  // Tracks the current key, so it always reads and writes whichever slice is current.
  const data = getDataRef(currentId);
  // Pins the key as it is right now. An operation that binds once up front and writes through this ref files its
  // Result under the key it was issued for even when the current key has moved on by the time it lands, which is
  // What `data` cannot do — it would file that result under whatever happens to be current at write time.
  const getBoundData = () => getDataRef(toValue(currentId));

  const initializeData = (newData: TItem) => {
    data.value = newData;
  };
  const resetData = () => {
    const currentIdValue = toValue(currentId);
    if (!currentIdValue) return;
    dataMap.value.delete(currentIdValue);
  };

  return {
    data,
    getBoundData,
    getData,
    getDataRef,
    initializeData,
    // Every key the map has been asked about, which is every key it holds — reading one creates its default
    keys: computed(() => [...dataMap.value.keys()]),
    resetData,
    setData,
  };
};
