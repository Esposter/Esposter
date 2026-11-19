import type { SpritesheetAsset } from "#src/models/dungeons/loader/SpritesheetAsset";
import type { SceneWithPlugins } from "vue-phaserjs";

export const loadSpritesheets = (scene: SceneWithPlugins, assets: Record<string, SpritesheetAsset>) => {
  for (const [key, asset] of Object.entries(assets))
    scene.load.spritesheet(key, asset.url, { frameHeight: asset.frameHeight, frameWidth: asset.frameWidth });
};
