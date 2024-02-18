import { type TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { SignObjectProperty } from "@/models/dungeons/world/home/SignObjectProperty";
import { DIALOG_WIDTH } from "@/services/dungeons/world/constants";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";

export const useInteractWithSign = (): boolean => {
  const dialogStore = useDialogStore();
  const { updateQueuedMessagesAndShowMessage } = dialogStore;
  const worldSceneStore = useWorldSceneStore();
  const { signLayer, isDialogVisible, dialogText } = storeToRefs(worldSceneStore);
  const interactiveObject = useFindInteractiveObject(signLayer.value.objects, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!interactiveObject) return false;

  const messageTiledObjectProperty = (interactiveObject.properties as TiledObjectProperty<string>[]).find(
    (p) => p.name === SignObjectProperty.message,
  );
  if (!messageTiledObjectProperty) return false;

  updateQueuedMessagesAndShowMessage(
    { text: dialogText, inputPromptCursorX: DIALOG_WIDTH - 16 },
    [messageTiledObjectProperty.value],
    () => {
      isDialogVisible.value = false;
    },
  );
  return true;
};
