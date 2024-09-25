import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useConfirmationMenuStore } from "@/store/dungeons/monsterParty/confirmationMenu";

export class ConfirmationMenuInputResolver extends AInputResolver {
  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const confirmationMenuStore = useConfirmationMenuStore();
    const { onPlayerInput } = confirmationMenuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
