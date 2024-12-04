import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";

import { SignObjectProperty } from "#shared/generated/tiled/propertyTypes/class/SignObjectProperty";
import { getTiledObjectProperty } from "@/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Direction } from "grid-engine";

export const signInteractionEffect: Effect = async (scene, signObjects) => {
  const signObject = useGetInteractiveObject(signObjects, {
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
    [Direction.UP]: true,
  });
  if (!signObject) return false;

  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const messageTiledObjectProperty = getTiledObjectProperty<string>(signObject.properties, SignObjectProperty.message);
  await showMessages(scene, [{ text: messageTiledObjectProperty.value }]);
  return true;
};
