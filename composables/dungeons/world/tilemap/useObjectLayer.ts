import type { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { NotFoundError } from "@/models/error/NotFoundError";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useObjectLayer = (objectgroupName: ObjectgroupName) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  const layer = tilemap.value.getObjectLayer(objectgroupName);
  if (!layer) throw new NotFoundError(useObjectLayer.name, objectgroupName);
  return layer;
};
