import type { SceneKey } from "@/models/keys/SceneKey";
import type { SceneWithPlugins } from "vue-phaser";

export type ListenersMap = Record<SceneKey, ((scene: SceneWithPlugins) => void)[]>;
