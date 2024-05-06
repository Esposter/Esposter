import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { DEBUG_TILE_LAYER_ALPHA } from "@/services/dungeons/tilemap/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

export const useCreateTilemapAssets = <TLayerName extends object>(layerNameEnum: TLayerName) => {
  const worldSceneStore = useWorldSceneStore();
  const { encounterLayer, objectLayerMap } = storeToRefs(worldSceneStore);

  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets: Tilemaps.Tileset[] = [];
    for (const tilesetKey of Object.values(TilesetKey)) {
      const tileset = useCreateTileset(tilesetKey);
      if (!tileset) continue;
      tilesets.push(tileset);
    }
    const layer = useCreateLayer(layerName, tilesets);
    if (layerName === LayerName.Encounter) encounterLayer.value = layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
    else if (layerName === LayerName.Collision) layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
  }

  for (const objectgroupName of Object.values(ObjectgroupName))
    objectLayerMap.value[objectgroupName] = useObjectLayer(objectgroupName);
};
