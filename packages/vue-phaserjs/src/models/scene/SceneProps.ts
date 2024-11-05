import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export interface SceneProps {
  autoStart?: boolean;
  sceneKey: SceneWithPlugins["scene"]["key"];
}
