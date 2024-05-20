import { getColorMap } from "@/services/clicker/properties/getColorMap";
import { useGameStore } from "@/store/clicker/game";

export const useClickerItemColor = () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const colors = useColors();
  return computed(() => getColorMap(colors)[game.value.type]);
};
