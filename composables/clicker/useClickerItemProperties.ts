import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";
import { IconComponentMap } from "@/services/clicker/type/IconComponentMap";
import { NameMap } from "@/services/clicker/type/NameMap";
import { PluralNameMap } from "@/services/clicker/type/PluralNameMap";
import { getColorMap } from "@/services/clicker/type/getColorMap";
import { useGameStore } from "@/store/clicker/game";

export const useClickerItemProperties = () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const colors = useColors();
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    name: NameMap[game.value.type],
    pluralName: PluralNameMap[game.value.type],
    color: getColorMap(colors)[game.value.type],
    iconComponent: IconComponentMap[game.value.type],
  }));
  return clickerItemProperties;
};
