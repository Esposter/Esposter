import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export interface State<TStateName extends null | string> {
  name: TStateName;
  onEnter?: (scene: SceneWithPlugins) => Promise<void> | void;
  onExit?: (scene: SceneWithPlugins) => Promise<void> | void;
}
