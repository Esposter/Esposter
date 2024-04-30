import { LayerName } from "@/generated/tiled/layers/LayerName";
import { ObjectgroupName } from "@/generated/tiled/layers/ObjectgroupName";
import { LayerNameTilesetKeysMap } from "@/services/dungeons/tilemap/LayerNameTilesetKeysMap";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

export const useCreateHomeTilemapAssets = () => {
  const settingsStore = useSettingsStore();
  const { debugTileLayerAlpha } = storeToRefs(settingsStore);
  const worldSceneStore = useWorldSceneStore();
  const { encounterLayer, signLayer, chestLayer } = storeToRefs(worldSceneStore);

  for (const [layerName, tilesetKeys] of Object.entries(LayerNameTilesetKeysMap)) {
    const tilesets = tilesetKeys.map((k) => useCreateTileset(k));
    const layer = useCreateLayer(layerName, tilesets);
    if (layerName === LayerName.Encounter) encounterLayer.value = layer.setAlpha(debugTileLayerAlpha.value);
    else if (layerName === LayerName.Collision) layer.setAlpha(debugTileLayerAlpha.value);
  }

  for (const objectgroupName of Object.values(ObjectgroupName)) {
    const objectLayer = useObjectLayer(objectgroupName);
    if (objectgroupName === ObjectgroupName.Sign) signLayer.value = objectLayer;
    else if (objectgroupName === ObjectgroupName.Chest) chestLayer.value = objectLayer;
  }
};
