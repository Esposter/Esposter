import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";
import { useDialogStore } from "#src/store/dungeons/dialog";
import { useWorldDialogStore } from "#src/store/dungeons/world/dialog";

export class MessageInputResolver extends AInputResolver {
  override async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const dialogStore = useDialogStore();
    const { onPlayerInput } = dialogStore;
    const worldDialogStore = useWorldDialogStore();
    const { isDialogVisible } = storeToRefs(worldDialogStore);

    if (isDialogVisible.value) {
      await onPlayerInput(scene, justDownInput);
      return true;
    }

    return false;
  }
}
