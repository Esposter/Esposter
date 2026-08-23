import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

export interface SceneProps {
  autoStart?: boolean;
  sceneKey: SceneWithPlugins["scene"]["key"];
}
