import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";

export class MessageInputResolver extends AInputResolver {
  override handleInputPre(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const dialogStore = useDialogStore();
    const { handleShowMessageInput } = dialogStore;
    const worldDialogStore = useWorldDialogStore();
    const { isDialogVisible } = storeToRefs(worldDialogStore);

    if (isDialogVisible.value) {
      handleShowMessageInput(scene, justDownInput);
      return true;
    }

    return false;
  }
}
