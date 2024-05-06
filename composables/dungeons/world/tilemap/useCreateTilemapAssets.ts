import { LayerName } from "@/generated/tiled/layers/Home/LayerName";
import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { DEBUG_TILE_LAYER_ALPHA } from "@/services/dungeons/tilemap/constants";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateTilemapAssets = <TLayerName extends object>(layerNameEnum: TLayerName) => {
  const worldSceneStore = useWorldSceneStore();
  const { encounterLayer, objectLayerMap } = storeToRefs(worldSceneStore);

  for (const layerName of Object.values(layerNameEnum)) {
    const tilesets = Object.values(TilesetKey).map((k) => useCreateTileset(k));
    const layer = useCreateLayer(layerName, tilesets);
    if (layerName === LayerName.Encounter) encounterLayer.value = layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
    else if (layerName === LayerName.Collision) layer.setAlpha(DEBUG_TILE_LAYER_ALPHA);
  }

  for (const objectgroupName of Object.values(ObjectgroupName))
    objectLayerMap.value[objectgroupName] = useObjectLayer(objectgroupName);
};
