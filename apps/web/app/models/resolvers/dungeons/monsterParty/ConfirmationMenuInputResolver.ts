import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";
import { useConfirmationMenuStore } from "#src/store/dungeons/monsterParty/confirmationMenu";

export class ConfirmationMenuInputResolver extends AInputResolver {
  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onPlayerInput } = confirmationMenuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
