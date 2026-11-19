import type { SceneWithPlugins } from "vue-phaserjs";

import { TilesetUrlMap } from "#src/services/dungeons/loader/TilesetUrlMap";

export const loadTilemaps = (scene: SceneWithPlugins, assets: Record<string, object>) => {
  for (const [key, url] of Object.entries(assets))
    scene.load.tilemapTiledJSONExternal({ key, tilesetURLs: TilesetUrlMap, url });
};
