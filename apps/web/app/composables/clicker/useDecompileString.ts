import { decompileVariables } from "#shared/services/compiler/decompileVariables";
import { useClickerStore } from "#src/store/clicker/index";

export const useDecompileString = (string: string) => {
  const clickerStore = useClickerStore();
  const { clickerItemProperties } = storeToRefs(clickerStore);
  return computed(() => {
    const { name, pluralName } = clickerItemProperties.value;
    return decompileVariables(string, { name, pluralName });
  });
};
