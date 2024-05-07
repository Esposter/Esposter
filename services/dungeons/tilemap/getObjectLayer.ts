import { NotFoundError } from "@/models/error/NotFoundError";
import { ExternalWorldSceneStore } from "@/store/dungeons/world/scene";

export const getObjectLayer = (layerName: string) => {
  const layer = ExternalWorldSceneStore.tilemap.getObjectLayer(layerName);
  if (!layer) throw new NotFoundError(getObjectLayer.name, layerName);
  return layer;
};
