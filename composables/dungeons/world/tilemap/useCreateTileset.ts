import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTileset = (tilesetKey: string) => {
  const worldSceneStore = useWorldSceneStore();
  const { tilemap } = storeToRefs(worldSceneStore);
  // We will enforce that the tileset name should exactly match the tileset key
  const tileset = tilemap.value.addTilesetImage(tilesetKey);
  if (!tileset) throw new Error(`Could not create tileset image, key: ${tilesetKey}`);
  return tileset;
};
