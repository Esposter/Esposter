import { type TiledObjectProperty } from "@/models/dungeons/tile/TiledObjectProperty";
import { SignObjectProperty } from "@/models/dungeons/world/home/SignObjectProperty";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";
import { DIALOG_WIDTH } from "~/services/dungeons/world/constants";

export const useInteractWithSign = () => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const worldSceneStore = useWorldSceneStore();
  const { signLayer, isDialogVisible, dialogText } = storeToRefs(worldSceneStore);
  const interactiveObject = useReadInteractiveObject(signLayer.value, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!interactiveObject) return;

  const messageTiledObjectProperty = (interactiveObject.properties as TiledObjectProperty<string>[]).find(
    (p) => p.name === SignObjectProperty.message,
  );
  if (!messageTiledObjectProperty) return;

  updateQueuedMessagesAndShowMessage(
    { text: dialogText, inputPromptCursorX: DIALOG_WIDTH - 16 },
    [messageTiledObjectProperty.value],
    () => {
      isDialogVisible.value = false;
    },
  );
};
