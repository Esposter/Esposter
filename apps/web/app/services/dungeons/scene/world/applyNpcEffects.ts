import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { SceneWithPlugins } from "vue-phaserjs";

import { applyNpcEffectsRecursive } from "@/services/dungeons/scene/world/applyNpcEffectsRecursive";

export const applyNpcEffects = async (scene: SceneWithPlugins, npc: Npc) => {
  await applyNpcEffectsRecursive(scene, npc, [...npc.effects]);
};
