import type { ReadonlyRefOrGetter } from "@vueuse/core";

export const createDataMap = <TItem extends NonNullable<unknown>>(
  currentId: ReadonlyRefOrGetter<string | undefined>,
  defaultValue: TItem,
) => {
  const dataMap: Ref<Map<string, TItem>> = ref(new Map());
  const getDataMap = (key: string) => dataMap.value.get(key);
  const setDataMap = (key: string, value: TItem) => {
    dataMap.value.set(key, value);
  };

  const data = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) return defaultValue;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return dataMap.value.get(currentIdValue) ?? dataMap.value.set(currentIdValue, defaultValue).get(currentIdValue)!;
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
    getDataMap,
    initializeData,
    resetData,
    setDataMap,
  };
};
