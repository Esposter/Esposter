import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

export const CreateTilemapAssetsMap: Record<TilemapKey, () => void> = {
  [TilemapKey.Home]: useCreateHomeTilemapAssets,
  // @TODO
  [TilemapKey.HomeBuilding1]: () => {},
  [TilemapKey.HomeBuilding2]: () => {},
};
