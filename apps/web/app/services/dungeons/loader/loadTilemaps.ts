import type { DungeonsKey } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import type { SceneWithPlugins } from "vue-phaserjs";

import { DungeonsKeys } from "#shared/generated/hostedAssetKeys/dungeonsKeys";
import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { getDungeonsUrl } from "#src/services/dungeons/loader/getDungeonsUrl";
import { trimFileExtension } from "#src/util/file/trimFileExtension";
import { getFilename } from "@esposter/shared";

// Each map's Tiled JSON, under the map's key
const TILEMAP_FILE_KEY_MAP = {
  [TilemapKey.Home]: DungeonsKeys.SceneWorldHomeTilemapJson,
  [TilemapKey.HomeBuilding1]: DungeonsKeys.SceneWorldHomeHomeBuilding1TilemapJson,
  [TilemapKey.HomeBuilding2]: DungeonsKeys.SceneWorldHomeHomeBuilding2TilemapJson,
} as const satisfies Record<TilemapKey, DungeonsKey>;

// Each tileset's Tiled definition, keyed by the tileset's name, which is its file's name without the extension
const getTilesetUrls = (origin: string): Record<string, string> =>
  Object.fromEntries(
    Object.values(DungeonsKeys)
      .filter((key) => key.endsWith(".tsx"))
      .map((key) => [trimFileExtension(getFilename(key)), getDungeonsUrl(origin, key)]),
  );

// A map's Tiled JSON loads by its url, and each tileset it names by the url of that tileset's definition
export const loadTilemaps = (scene: SceneWithPlugins, origin: string) => {
  const tilesetURLs = getTilesetUrls(origin);
  for (const [key, fileKey] of Object.entries(TILEMAP_FILE_KEY_MAP))
    scene.load.tilemapTiledJSONExternal({ key, tilesetURLs, url: getDungeonsUrl(origin, fileKey) });
};
