import { usePhaserListener } from "@/lib/phaser/composables/usePhaserListener";
import { EFFECT_COMPLETE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { applyNpcEffect } from "@/services/dungeons/scene/world/applyNpcEffect";

export const applyNpcEffects = async (scene: SceneWithPlugins, npc: Npc) => {
  const effects = [...npc.effects];
  await applyNpcEffect(scene, npc, effects.shift());
  usePhaserListener(`${npc.name}${EFFECT_COMPLETE_EVENT_KEY}`, async () => {
    await applyNpcEffect(scene, npc, effects.shift());
  });
};
