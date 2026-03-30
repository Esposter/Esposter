import { decompileVariable } from "@/services/clicker/compiler/decompileVariable";
import { useClickerStore } from "@/store/clicker";

export const useDecompileString = (string: string) => {
  const clickerStore = useClickerStore();
  const { clickerItemProperties } = storeToRefs(clickerStore);
  return computed(() => decompileVariable(string, clickerItemProperties.value));
};
