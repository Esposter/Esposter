import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { isMovingDirection } from "@/services/dungeons/input/isMovingDirection";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useWorldMenuStore = defineStore("dungeons/world/menu", () => {
  const worldSceneStore = useWorldSceneStore();
  const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
  const onPlayerInput = (input: PlayerInput) => {
    // @TODO
    if (input === PlayerSpecialInput.Confirm) return;
    else if (input === PlayerSpecialInput.Enter || input === PlayerSpecialInput.Cancel) isMenuVisible.value = false;
    else if (isMovingDirection(input)) menuOptionGrid.value.move(input);
  };
  return { onPlayerInput };
});
