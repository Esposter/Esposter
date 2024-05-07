import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { interactWithObject } from "@/services/dungeons/tilemap/interactWithObject";

export const useInteractions = (scene: SceneWithPlugins) => useInteractWithNpc(scene) || interactWithObject(scene);
