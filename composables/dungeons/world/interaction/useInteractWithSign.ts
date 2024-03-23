import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { SignObjectProperty } from "@/models/dungeons/world/home/SignObjectProperty";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { SetRequired } from "@/util/types/SetRequired";
import { Direction } from "grid-engine";
import type { ArrayElement } from "type-fest/source/internal";

export const useInteractWithSign = (): boolean => {
  const worldSceneStore = useWorldSceneStore();
  const { signLayer } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const objects: SetRequired<ArrayElement<typeof signLayer.value.objects>, "x" | "y">[] = [];

  for (const { x, y, ...rest } of signLayer.value.objects) {
    if (!(x && y)) continue;
    objects.push({ ...useObjectUnitPosition({ x, y }), ...rest });
  }

  const interactiveObject = useFindInteractiveObject(objects, {
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

  showMessages([messageTiledObjectProperty.value]);
  return true;
};
