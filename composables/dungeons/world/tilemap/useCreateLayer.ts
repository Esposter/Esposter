import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { type Tilemaps } from "phaser";

export const useCreateLayer = (layerId: string, tileset: Tilemaps.Tileset | Tilemaps.Tileset[]) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  const layer = tilemap.value.createLayer(layerId, tileset);
  if (!layer) throw new Error(`Could not create tilemap layer, layer id: ${layerId}`);
  return layer;
};
