import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";
import type { SceneWithPlugins } from "vue-phaserjs";

export const loadTilesets = (scene: SceneWithPlugins, assets: Record<string, string | SpritesheetAsset>) => {
  for (const [key, asset] of Object.entries(assets))
    if (typeof asset === "string") scene.load.image(key, asset);
    else scene.load.spritesheet(key, asset.url, { frameHeight: asset.frameHeight, frameWidth: asset.frameWidth });
};
