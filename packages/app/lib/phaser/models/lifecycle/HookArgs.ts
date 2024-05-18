import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
// When using hooks inside <Scene /> event emitters, we should pass in the sceneKey
// as we cannot use vue's injection to provide the key
export type HookArgs = [listener: (scene: SceneWithPlugins) => void, sceneKey?: SceneKey];
