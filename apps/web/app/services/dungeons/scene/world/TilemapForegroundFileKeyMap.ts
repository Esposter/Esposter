import { FileKey } from "#shared/generated/phaser/FileKey";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

// The blob layout nests a building's assets under the map it stands in, so a foreground key is not its tilemap
// Key between a prefix and a suffix — only a lookup gets `HomeBuilding1` to `SceneWorldHomeHomeBuilding1Foreground`
export const TilemapForegroundFileKeyMap = {
  [TilemapKey.Home]: FileKey.SceneWorldHomeForeground,
  [TilemapKey.HomeBuilding1]: FileKey.SceneWorldHomeHomeBuilding1Foreground,
  [TilemapKey.HomeBuilding2]: FileKey.SceneWorldHomeHomeBuilding2Foreground,
} as const satisfies Record<TilemapKey, FileKey>;
