import { getColorMap } from "@/services/clicker/properties/getColorMap";
import { useClickerStore } from "@/store/clicker";

export const useClickerItemColor = () => {
  const clickerStore = useClickerStore();
  const { game } = storeToRefs(clickerStore);
  const colors = useColors();
  return computed(() => getColorMap(colors)[game.value.type]);
};
