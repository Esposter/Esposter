import { decompileVariables } from "#shared/services/compiler/decompileVariables";
import { useClickerStore } from "@/store/clicker";

export const useDecompileString = (string: string) => {
  const clickerStore = useClickerStore();
  const { clickerItemProperties } = storeToRefs(clickerStore);
  return computed(() => decompileVariables(string, { ...clickerItemProperties.value }));
};
