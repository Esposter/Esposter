import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { applyScenePluginsMixin } from "@/models/dungeons/scene/ScenePlugins";
import { Scene } from "phaser";

export type SceneWithPlugins = typeof SceneWithPlugins.prototype & { scene: { key: SceneKey } };
export const SceneWithPlugins = applyScenePluginsMixin(Scene);
