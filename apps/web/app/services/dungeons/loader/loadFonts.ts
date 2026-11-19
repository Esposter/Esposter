import type { SceneWithPlugins } from "vue-phaserjs";

export const loadFonts = (scene: SceneWithPlugins, assets: Record<string, string>) => {
  for (const [key, asset] of Object.entries(assets)) scene.load.font(key, asset);
};
