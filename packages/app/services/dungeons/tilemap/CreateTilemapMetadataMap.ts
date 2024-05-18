import { LayerName as HomeBuilding1LayerName } from "@/generated/tiled/layers/Home/HomeBuilding1/LayerName";
import { LayerName as HomeBuilding2LayerName } from "@/generated/tiled/layers/Home/HomeBuilding2/LayerName";
import { LayerName as HomeLayerName } from "@/generated/tiled/layers/Home/LayerName";
import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { TilemapMetadataParams } from "@/models/dungeons/tilemap/TilemapMetadataParams";
import { createTilemapMetadata } from "@/services/dungeons/tilemap/createTilemapMetadata";

export const CreateTilemapMetadataMap = {
  [TilemapKey.Home]: (...args) => {
    createTilemapMetadata(HomeLayerName, ...args);
  },
  [TilemapKey.HomeBuilding1]: (...args) => {
    createTilemapMetadata(HomeBuilding1LayerName, ...args);
  },
  [TilemapKey.HomeBuilding2]: (...args) => {
    createTilemapMetadata(HomeBuilding2LayerName, ...args);
  },
} as const satisfies Record<TilemapKey, (...args: TilemapMetadataParams) => void>;
