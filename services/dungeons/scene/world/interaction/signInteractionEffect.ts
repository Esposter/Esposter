import { SignObjectProperty } from "@/generated/tiled/propertyTypes/class/SignObjectProperty";
import type { Effect } from "@/models/dungeons/scene/world/interaction/Effect";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { NotFoundError } from "@/models/error/NotFoundError";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Direction } from "grid-engine";

export const signInteractionEffect: Effect = (signObjects) => {
  const signObject = useGetInteractiveObject(signObjects, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!signObject) return false;

  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const messageTiledObjectProperty = (signObject.properties as TiledObjectProperty<string>[]).find(
    (p) => p.name === SignObjectProperty.message,
  );
  if (!messageTiledObjectProperty) throw new NotFoundError(signInteractionEffect.name, SignObjectProperty.message);

  showMessages([{ text: messageTiledObjectProperty.value }]);
  return true;
};
