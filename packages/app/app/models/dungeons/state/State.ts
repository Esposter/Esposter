import type { Promisable } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";

export interface State<TStateName extends string | undefined> {
  name: TStateName;
  onEnter?: (scene: SceneWithPlugins) => Promisable<void>;
  onExit?: (scene: SceneWithPlugins) => Promisable<void>;
}
