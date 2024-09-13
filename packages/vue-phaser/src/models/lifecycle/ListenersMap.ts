import type { SceneKey } from "@/models/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export type ListenersMap = Record<SceneKey, ((scene: SceneWithPlugins) => void)[]>;
