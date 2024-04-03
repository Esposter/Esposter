import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export class MessageInputResolver extends AInputResolver {
  handleInputPre(justDownInput: PlayerInput) {
    const worldSceneStore = useWorldSceneStore();
    const { isDialogVisible } = storeToRefs(worldSceneStore);
    const dialogStore = useDialogStore();
    const { handleShowMessageInput } = dialogStore;

    if (isDialogVisible.value) {
      handleShowMessageInput(justDownInput);
      return true;
    }

    return false;
  }
}
