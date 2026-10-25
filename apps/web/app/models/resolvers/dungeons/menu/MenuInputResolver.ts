import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";

type MenuStore = { onPlayerInput: (scene: SceneWithPlugins, justDownInput: PlayerInput) => boolean | Promise<boolean> };

export class MenuInputResolver extends AInputResolver {
  private readonly useMenuStore: () => MenuStore;

  constructor(useMenuStore: () => MenuStore) {
    super();
    this.useMenuStore = useMenuStore;
  }

  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const menuStore = this.useMenuStore();
    const { onPlayerInput } = menuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
