import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export type ListenersMap = Record<SceneKey, ((scene: SceneWithPlugins) => void)[]>;
