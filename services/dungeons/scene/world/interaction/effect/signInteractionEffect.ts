import { SignObjectProperty } from "@/generated/tiled/propertyTypes/class/SignObjectProperty";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Direction } from "grid-engine";

export const signInteractionEffect: Effect = (scene, signObjects) => {
  const signObject = useGetInteractiveObject(signObjects, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!signObject) return false;

  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const messageTiledObjectProperty = getTiledObjectProperty<string>(signObject.properties, SignObjectProperty.message);
  showMessages(scene, [{ text: messageTiledObjectProperty.value }]);
  return true;
};
