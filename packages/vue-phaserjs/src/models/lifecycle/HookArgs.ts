import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
// When using hooks inside <Scene /> event emitters, we should pass in the sceneKey
// As we cannot use vue's injection to provide the key
export type HookArgs = [listener: (scene: SceneWithPlugins) => void, sceneKey?: SceneWithPlugins["scene"]["key"]];
