import type { ReadonlyRefOrGetter } from "@vueuse/core";

export const useDataMap = <TItem>(currentId: ReadonlyRefOrGetter<string | undefined>, defaultValue: TItem) => {
  const dataMap: Ref<Map<string, TItem>> = ref(new Map());
  const getDataMap = (key: string) => dataMap.value.get(key);
  const setDataMap = (key: string, value: TItem) => {
    dataMap.value.set(key, value);
  };

  const data = computed({
    get: () => {
      const currentIdValue = toValue(currentId);
      if (!currentIdValue) {
        const clonedDefaultValue = structuredClone(defaultValue);
        return clonedDefaultValue;
      }

      const value = dataMap.value.get(currentIdValue);
      if (!value) {
        const clonedDefaultValue = structuredClone(defaultValue);
        dataMap.value.set(currentIdValue, clonedDefaultValue);
        return dataMap.value.get(currentIdValue) ?? clonedDefaultValue;
      }
      return value;
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
