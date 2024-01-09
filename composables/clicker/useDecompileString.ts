import { decompileVariable } from "@/services/clicker/compiler/decompileVariable";

export const useDecompileString = (string: string) => {
  const clickerItemProperties = useClickerItemProperties();
  return computed(() => decompileVariable(string, clickerItemProperties.value));
};
