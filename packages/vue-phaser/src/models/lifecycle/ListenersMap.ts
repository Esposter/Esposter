import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export type ListenersMap = Map<string, ((scene: SceneWithPlugins) => void)[]>;
