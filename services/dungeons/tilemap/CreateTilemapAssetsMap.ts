import { LayerName as HomeBuilding1LayerName } from "@/generated/tiled/layers/Home/HomeBuilding1/LayerName";
import { LayerName as HomeBuilding2LayerName } from "@/generated/tiled/layers/Home/HomeBuilding2/LayerName";
import { LayerName as HomeLayerName } from "@/generated/tiled/layers/Home/LayerName";
import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

export const CreateTilemapAssetsMap = {
  [TilemapKey.Home]: () => useCreateTilemapAssets(HomeLayerName),
  [TilemapKey.HomeBuilding1]: () => useCreateTilemapAssets(HomeBuilding1LayerName),
  [TilemapKey.HomeBuilding2]: () => useCreateTilemapAssets(HomeBuilding2LayerName),
} as const satisfies Record<TilemapKey, () => void>;
