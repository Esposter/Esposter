import type { ScenePlugins } from "#src/models/scene/ScenePlugins";
import type { Scene } from "phaser";

export interface SceneWithPlugins extends Scene, ScenePlugins {}
