import type { SceneWithPlugins } from "vue-phaserjs";

export interface State<TStateName extends string | undefined> {
  name: TStateName;
  onEnter?: (scene: SceneWithPlugins) => Promise<void> | void;
  onExit?: (scene: SceneWithPlugins) => Promise<void> | void;
}
