import { ClickerType } from "@/models/clicker/ClickerType";
import { useGameStore } from "@/store/clicker/game";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

// @ts-expect-error Typescript doesn't check switch statements properly
export const useClickerItemColor = (): string => {
  const gameStore = useGameStore();
  const { game } = storeToRefs(gameStore);
  const { primary, error, info } = useColors();

  switch (game.value.type) {
    case ClickerType.Default:
      return primary.value;
    case ClickerType.Physical:
      return error.value;
    case ClickerType.Magical:
      return info.value;
    default:
      exhaustiveGuard(game.value.type);
  }
};
