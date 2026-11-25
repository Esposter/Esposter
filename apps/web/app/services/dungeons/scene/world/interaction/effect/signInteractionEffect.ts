import type { Effect } from "#src/models/dungeons/scene/world/interaction/Effect";

import { SignObjectProperty } from "#shared/generated/tiled/propertyTypes/class/SignObjectProperty";
import { DialogMessage } from "#src/models/dungeons/UI/dialog/DialogMessage";
import { getInteractiveObject } from "#src/services/dungeons/scene/world/interaction/getInteractiveObject";
import { getTiledObjectProperty } from "#src/services/dungeons/tilemap/getTiledObjectProperty";
import { useWorldDialogStore } from "#src/store/dungeons/world/dialog";
import { Direction } from "grid-engine-headless";

export const signInteractionEffect: Effect = async (scene, signObjects) => {
  const signObject = getInteractiveObject(signObjects, {
    [Direction.Down]: false,
    [Direction.Left]: false,
    [Direction.Right]: false,
    [Direction.Up]: true,
  });
  if (!signObject) return false;

  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const messageTiledObjectProperty = getTiledObjectProperty<string>(signObject.properties, SignObjectProperty.Message);
  await showMessages(scene, [new DialogMessage({ text: messageTiledObjectProperty.value })]);
  return true;
};
