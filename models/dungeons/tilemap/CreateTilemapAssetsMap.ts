import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";

export const CreateTilemapAssetsMap: Record<TilemapKey, () => void> = {
  [TilemapKey.Home]: useCreateHomeTilemapAssets,
};
