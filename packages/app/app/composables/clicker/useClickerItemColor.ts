import { getColorMap } from "@/services/clicker/properties/getColorMap";
import { useClickerStore } from "@/store/clicker";

export const useClickerItemColor = () => {
  const clickerStore = useClickerStore();
  const { clicker } = storeToRefs(clickerStore);
  const colors = useColors();
  return computed(() => getColorMap(colors)[clicker.value.type]);
};
