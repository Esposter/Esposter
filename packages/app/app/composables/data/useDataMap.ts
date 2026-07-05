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

  const data = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return createDefaultValue();

      const value = dataMap.value.get(currentIdValue);
      if (value) return value;

      const newDefaultValue = createDefaultValue();
      dataMap.value.set(currentIdValue, newDefaultValue);
      // Return the value read back from the reactive map, not the raw object we just created — the map
      // Wraps object values in a reactive proxy on read, so returning newDefaultValue directly would hand
      // Callers (and deep watchers) a non-reactive object whose later mutations never trigger reactivity.
      return dataMap.value.get(currentIdValue) ?? newDefaultValue;
    },
    set: (newData) => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return;
      dataMap.value.set(currentIdValue, newData);
    },
  });

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
    getData,
    initializeData,
    resetData,
    setData,
  };
};
