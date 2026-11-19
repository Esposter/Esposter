import type { SceneWithPlugins } from "vue-phaserjs";

export const loadImages = (scene: SceneWithPlugins, assets: Record<string, string>) => {
  for (const [key, asset] of Object.entries(assets)) scene.load.image(key, asset);
};
