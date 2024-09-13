import type { SceneKey } from "@/models/keys/SceneKey";
import type { ScenePlugins } from "@/models/scene/ScenePlugins";
import type { Scene } from "phaser";

export interface SceneWithPlugins extends Scene, ScenePlugins {
  scene: { key: SceneKey } & Scene["scene"];
}
