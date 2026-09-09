import type { Loader } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

export type AssetLoader = (scene: SceneWithPlugins) => Loader.LoaderPlugin;
