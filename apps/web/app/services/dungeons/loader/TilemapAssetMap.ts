import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import homeBuilding1 from "#src/assets/dungeons/scene/world/Home/HomeBuilding1/tilemap.json";
import homeBuilding2 from "#src/assets/dungeons/scene/world/Home/HomeBuilding2/tilemap.json";
import home from "#src/assets/dungeons/scene/world/Home/tilemap.json";

export const TilemapAssetMap = {
  [TilemapKey.Home]: home,
  [TilemapKey.HomeBuilding1]: homeBuilding1,
  [TilemapKey.HomeBuilding2]: homeBuilding2,
} as const satisfies Record<TilemapKey, object>;
