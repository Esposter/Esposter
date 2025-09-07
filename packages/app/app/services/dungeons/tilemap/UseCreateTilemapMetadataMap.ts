import { LayerName as HomeBuilding1LayerName } from "#shared/generated/tiled/layers/Home/HomeBuilding1/LayerName";
import { LayerName as HomeBuilding2LayerName } from "#shared/generated/tiled/layers/Home/HomeBuilding2/LayerName";
import { LayerName as HomeLayerName } from "#shared/generated/tiled/layers/Home/LayerName";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

export const UseCreateTilemapMetadataMap = {
  [TilemapKey.Home]: () => {
    useCreateTilemapMetadata(HomeLayerName);
  },
  [TilemapKey.HomeBuilding1]: () => {
    useCreateTilemapMetadata(HomeBuilding1LayerName);
  },
  [TilemapKey.HomeBuilding2]: () => {
    useCreateTilemapMetadata(HomeBuilding2LayerName);
  },
} as const satisfies Record<TilemapKey, () => void>;
