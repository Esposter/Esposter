import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export interface State<TStateName extends string | null> {
  name: TStateName;
  onEnter?: (scene: SceneWithPlugins) => void | Promise<void>;
  onExit?: (scene: SceneWithPlugins) => void | Promise<void>;
}
