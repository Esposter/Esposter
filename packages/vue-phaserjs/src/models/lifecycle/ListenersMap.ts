import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

export type ListenersMap = Map<string, ((scene: SceneWithPlugins) => void)[]>;
