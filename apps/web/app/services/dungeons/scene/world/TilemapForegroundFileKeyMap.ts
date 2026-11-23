import { FileKey } from "#shared/generated/phaser/FileKey";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

// The bucket nests a building's assets under its map, so no prefix or suffix makes a foreground key from a tilemap key.
// Only a lookup maps `HomeBuilding1` to `SceneWorldHomeHomeBuilding1Foreground`
export const TilemapForegroundFileKeyMap = {
  [TilemapKey.Home]: FileKey.SceneWorldHomeForeground,
  [TilemapKey.HomeBuilding1]: FileKey.SceneWorldHomeHomeBuilding1Foreground,
  [TilemapKey.HomeBuilding2]: FileKey.SceneWorldHomeHomeBuilding2Foreground,
} as const satisfies Record<TilemapKey, FileKey>;
