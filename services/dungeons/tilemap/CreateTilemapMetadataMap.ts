import { LayerName as HomeBuilding1LayerName } from "@/generated/tiled/layers/Home/HomeBuilding1/LayerName";
import { LayerName as HomeBuilding2LayerName } from "@/generated/tiled/layers/Home/HomeBuilding2/LayerName";
import { LayerName as HomeLayerName } from "@/generated/tiled/layers/Home/LayerName";
import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { createTilemapMetadata } from "@/services/dungeons/tilemap/createTilemapMetadata";

export const CreateTilemapMetadataMap = {
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
