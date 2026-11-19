import type { SceneWithPlugins } from "vue-phaserjs";

export const loadSounds = (scene: SceneWithPlugins, assets: Record<string, string>) => {
  for (const [key, asset] of Object.entries(assets)) scene.load.audio(key, asset);
};
