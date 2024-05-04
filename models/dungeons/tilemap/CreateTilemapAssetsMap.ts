import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";

export const CreateTilemapAssetsMap: Record<TilemapKey, () => void> = {
  [TilemapKey.Home]: useCreateHomeTilemapAssets,
};
