import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export interface SceneLifecycleHooks {
  onCreate?: (scene: SceneWithPlugins) => void;
  onInit?: (scene: SceneWithPlugins) => void;
  onPreload?: (scene: SceneWithPlugins) => void;
  onUpdate?: (scene: SceneWithPlugins, time: number, delta: number) => void;
}
