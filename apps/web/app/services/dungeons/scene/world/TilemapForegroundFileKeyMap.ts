import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

// The bucket nests a building's assets under its map, so no prefix or suffix makes a foreground key from a tilemap key.
// Only a lookup maps `HomeBuilding1` to `SceneWorldHomeHomeBuilding1Foreground`
export const TilemapForegroundFileKeyMap = {
  [TilemapKey.Home]: DungeonsKeys.SceneWorldHomeForeground,
  [TilemapKey.HomeBuilding1]: DungeonsKeys.SceneWorldHomeHomeBuilding1Foreground,
  [TilemapKey.HomeBuilding2]: DungeonsKeys.SceneWorldHomeHomeBuilding2Foreground,
} as const satisfies Record<TilemapKey, DungeonsKey>;
