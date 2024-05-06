import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export type HookArgs = [listener: (scene: SceneWithPlugins) => void, sceneKey?: SceneKey];
