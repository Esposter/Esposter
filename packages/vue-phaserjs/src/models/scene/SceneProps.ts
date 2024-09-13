import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export interface SceneProps {
  autoStart?: true;
  sceneKey: SceneWithPlugins["scene"]["key"];
}
