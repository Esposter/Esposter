import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useInteractions = (scene: SceneWithPlugins) => useInteractWithNpc(scene) || useInteractWithObject(scene);
