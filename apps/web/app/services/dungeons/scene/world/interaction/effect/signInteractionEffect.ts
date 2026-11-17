import type { Effect } from "#src/models/dungeons/scene/world/interaction/Effect";

import { SignObjectProperty } from "#shared/generated/tiled/propertyTypes/class/SignObjectProperty";
import { getInteractiveObject } from "#src/services/dungeons/scene/world/interaction/getInteractiveObject";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldDialogStore } from "#src/store/dungeons/world/dialog";
import { Direction } from "grid-engine";

export const signInteractionEffect: Effect = async (scene, signObjects) => {
  const signObject = getInteractiveObject(signObjects, {
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
    [Direction.UP]: true,
  });
  if (!signObject) return false;

  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const messageTiledObjectProperty = getTiledObjectProperty<string>(signObject.properties, SignObjectProperty.Message);
  await showMessages(scene, [{ text: messageTiledObjectProperty.value }]);
  return true;
};
