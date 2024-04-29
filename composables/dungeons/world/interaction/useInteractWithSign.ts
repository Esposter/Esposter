import { SignObjectProperty } from "@/generated/tiled/propertyTypes/class/SignObjectProperty";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Direction } from "grid-engine";
import type { Position } from "grid-engine";
import type { SetRequired } from "type-fest";
import type { ArrayElement } from "type-fest/source/internal";

export const useInteractWithSign = (): boolean => {
  const worldSceneStore = useWorldSceneStore();
  const { signLayer } = storeToRefs(worldSceneStore);
  const worldDialogStore = useWorldDialogStore();
  const { showMessages } = worldDialogStore;
  const signObjects: SetRequired<ArrayElement<typeof signLayer.value.objects>, keyof Position>[] = [];

  for (const { x, y, ...rest } of signLayer.value.objects) {
    if (!(x && y)) continue;
    signObjects.push({ ...useObjectUnitPosition({ x, y }), ...rest });
  }

  const sign = useGetInteractiveObject(signObjects, {
    [Direction.UP]: true,
    [Direction.DOWN]: false,
    [Direction.LEFT]: false,
    [Direction.RIGHT]: false,
  });
  if (!sign) return false;

  const messageTiledObjectProperty = (sign.properties as TiledObjectProperty<string>[]).find(
    (p) => p.name === SignObjectProperty.message,
  );
  if (!messageTiledObjectProperty) return false;

  showMessages([{ text: messageTiledObjectProperty.value }]);
  return true;
};
