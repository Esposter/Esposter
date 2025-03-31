export const createDataMap = <TItem extends NonNullable<unknown>>(
  currentId: MaybeRefOrGetter<string | undefined>,
  defaultValue: TItem,
) => {
  const dataMap: Ref<Map<string, TItem>> = ref(new Map());
  const data = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return defaultValue;
      return dataMap.value.get(currentIdValue) ?? defaultValue;
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
    initializeData,
    resetData,
  };
};
