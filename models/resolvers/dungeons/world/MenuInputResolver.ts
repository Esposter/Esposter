import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useWorldMenuStore } from "@/store/dungeons/world/menu";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export class MenuInputResolver extends AInputResolver {
  async handleInputPre(justDownInput: PlayerInput) {
    const worldSceneStore = useWorldSceneStore();
    const { isMenuVisible } = storeToRefs(worldSceneStore);
    const worldMenuStore = useWorldMenuStore();
    const { onPlayerInput } = worldMenuStore;

    if (isMenuVisible.value) {
      await onPlayerInput(justDownInput);
      return true;
    }

    return false;
  }

  handleInput(justDownInput: PlayerInput) {
    const worldSceneStore = useWorldSceneStore();
    const { isMenuVisible } = storeToRefs(worldSceneStore);

    if (justDownInput === PlayerSpecialInput.Enter) {
      isMenuVisible.value = true;
      return true;
    }

    return false;
  }
}
