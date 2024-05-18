import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";
import { IconComponentMap } from "@/services/clicker/properties/IconComponentMap";
import { NameMap } from "@/services/clicker/properties/NameMap";
import { PluralNameMap } from "@/services/clicker/properties/PluralNameMap";
import { useGameStore } from "@/store/clicker/game";

export const useClickerItemProperties = () => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const clickerItemColor = useClickerItemColor();
  const clickerItemProperties = computed<ClickerItemProperties>(() => ({
    name: NameMap[game.value.type],
    pluralName: PluralNameMap[game.value.type],
    color: clickerItemColor.value,
    iconComponent: IconComponentMap[game.value.type],
  }));
  return clickerItemProperties;
};
