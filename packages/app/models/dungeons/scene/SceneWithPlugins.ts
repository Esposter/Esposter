import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { ScenePlugins } from "@/models/dungeons/scene/ScenePlugins";
import type { Scene } from "phaser";

export interface SceneWithPlugins extends Scene, ScenePlugins {
  scene: { key: SceneKey } & Scene["scene"];
}
