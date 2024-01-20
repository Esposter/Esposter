import { applyScenePluginsMixin } from "@/models/dungeons/scenes/plugins/ScenePlugins";
import { Scene } from "phaser";

export type SceneWithPlugins = typeof SceneWithPlugins.prototype;
export const SceneWithPlugins = applyScenePluginsMixin(Scene);
