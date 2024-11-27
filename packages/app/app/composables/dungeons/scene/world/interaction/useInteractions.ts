import type { SceneWithPlugins } from "vue-phaserjs";

import { interactWithObject } from "@/services/dungeons/tilemap/interactWithObject";

export const useInteractions = async (scene: SceneWithPlugins) =>
  (await useInteractWithNpc(scene)) || (await interactWithObject(scene));
