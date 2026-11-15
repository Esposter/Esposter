import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";

interface MenuStore {
  onPlayerInput: (scene: SceneWithPlugins, justDownInput: PlayerInput) => boolean | Promise<boolean>;
}

export class MenuInputResolver extends AInputResolver {
  readonly #useMenuStore: () => MenuStore;

  constructor(useMenuStore: () => MenuStore) {
    super();
    this.#useMenuStore = useMenuStore;
  }

  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const menuStore = this.#useMenuStore();
    const { onPlayerInput } = menuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
