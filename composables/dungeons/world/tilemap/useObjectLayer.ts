import { type ObjectLayer } from "@/models/dungeons/world/home/ObjectLayer";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useObjectLayer = (objectLayer: ObjectLayer) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  const layer = tilemap.value.getObjectLayer(objectLayer);
  if (!layer) throw new Error(`Could not get object layer, name: ${objectLayer}`);
  return layer;
};
