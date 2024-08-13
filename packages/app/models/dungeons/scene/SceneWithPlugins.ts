import type { SceneKey } from "@/models/dungeons/keys/SceneKey";

import { applyScenePluginsMixin } from "@/models/dungeons/scene/ScenePlugins";
import { Scene } from "phaser";

export type SceneWithPlugins = { scene: { key: SceneKey } } & typeof SceneWithPlugins.prototype;
export const SceneWithPlugins = applyScenePluginsMixin(Scene);
