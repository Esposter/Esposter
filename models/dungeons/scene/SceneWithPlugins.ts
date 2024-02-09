import { applyScenePluginsMixin } from "@/models/dungeons/scene/ScenePlugins";
import { Scene } from "phaser";

export type SceneWithPlugins = typeof SceneWithPlugins.prototype;
export const SceneWithPlugins = applyScenePluginsMixin(Scene);
