import { applyScenePluginsMixin } from "@/models/dungeons/scene/plugins/ScenePlugins";
import { Scene } from "phaser";

export type SceneWithPlugins = typeof SceneWithPlugins.prototype;
export const SceneWithPlugins = applyScenePluginsMixin(Scene);
