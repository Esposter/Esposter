import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useMenuStore } from "@/store/dungeons/world/menu";

export class MenuInputResolver extends AInputResolver {
  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const menuStore = useMenuStore();
    const { onPlayerInput } = menuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
