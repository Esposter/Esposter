import type { ObjectType } from "@/generated/tiled/propertyTypes/class/ObjectType";
import { NotFoundError } from "@/models/error/NotFoundError";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useObjectLayer = (objectType: ObjectType) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  const layer = tilemap.value.getObjectLayer(objectType);
  if (!layer) throw new NotFoundError(useObjectLayer.name, objectType);
  return layer;
};
