import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";

export class MessageInputResolver extends AInputResolver {
  handleInputPre(justDownInput: PlayerInput, input: PlayerInput, scene: SceneWithPlugins) {
    const dialogStore = useDialogStore();
    const { handleShowMessageInput } = dialogStore;
    const worldDialogStore = useWorldDialogStore();
    const { isDialogVisible } = storeToRefs(worldDialogStore);

    if (isDialogVisible.value) {
      handleShowMessageInput(justDownInput, scene);
      return true;
    }

    return false;
  }
}
