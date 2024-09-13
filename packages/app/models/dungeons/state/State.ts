import type { SceneWithPlugins } from "vue-phaserjs";

export interface State<TStateName extends null | string> {
  name: TStateName;
  onEnter?: (scene: SceneWithPlugins) => Promise<void> | void;
  onExit?: (scene: SceneWithPlugins) => Promise<void> | void;
}
