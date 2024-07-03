import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useMenuStore } from "@/store/dungeons/world/menu";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export class MenuInputResolver extends AInputResolver {
  override async handleInputPre(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const worldSceneStore = useWorldSceneStore();
    const { isMenuVisible } = storeToRefs(worldSceneStore);
    const menuStore = useMenuStore();
    const { onPlayerInput } = menuStore;

    if (isMenuVisible.value) {
      await onPlayerInput(scene, justDownInput);
      return true;
    }

    return false;
  }

  override handleInput(_scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const worldSceneStore = useWorldSceneStore();
    const { isMenuVisible } = storeToRefs(worldSceneStore);

    if (justDownInput === PlayerSpecialInput.Enter) {
      isMenuVisible.value = true;
      return true;
    }

    return false;
  }
}
