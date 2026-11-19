import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";
import type { SceneWithPlugins } from "vue-phaserjs";

import { loadImages } from "#src/services/dungeons/loader/loadImages";
import { loadSpritesheets } from "#src/services/dungeons/loader/loadSpritesheets";

export const loadTilesets = (scene: SceneWithPlugins, assets: Record<string, SpritesheetAsset | string>) => {
  const images: Record<string, string> = {};
  const spritesheets: Record<string, SpritesheetAsset> = {};
  for (const [key, asset] of Object.entries(assets))
    if (typeof asset === "string") images[key] = asset;
    else spritesheets[key] = asset;
  loadImages(scene, images);
  loadSpritesheets(scene, spritesheets);
};
