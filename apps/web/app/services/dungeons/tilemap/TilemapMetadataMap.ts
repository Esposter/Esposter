import { LayerName as HomeBuilding1LayerName } from "#shared/generated/tiled/layers/Home/HomeBuilding1/LayerName";
import { LayerName as HomeBuilding2LayerName } from "#shared/generated/tiled/layers/Home/HomeBuilding2/LayerName";
import { LayerName as HomeLayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { createTilemapMetadata } from "#src/services/dungeons/tilemap/createTilemapMetadata";

export const TilemapMetadataMap = {
  [TilemapKey.Home]: () => {
    createTilemapMetadata(HomeLayerName);
  },
  [TilemapKey.HomeBuilding1]: () => {
    createTilemapMetadata(HomeBuilding1LayerName);
  },
  [TilemapKey.HomeBuilding2]: () => {
    createTilemapMetadata(HomeBuilding2LayerName);
  },
} as const satisfies Record<TilemapKey, () => void>;
