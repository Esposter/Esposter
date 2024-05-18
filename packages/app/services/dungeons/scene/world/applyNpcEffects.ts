import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { EFFECT_COMPLETE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { applyNpcEffect } from "@/services/dungeons/scene/world/applyNpcEffect";

export const applyNpcEffects = async (scene: SceneWithPlugins, npc: Npc) => {
  await applyNpcEffectsRecursive(scene, npc, [...npc.effects]);
};

const applyNpcEffectsRecursive = async (scene: SceneWithPlugins, npc: Npc, effects: Effect[]) => {
  if (effects.length > 1)
    phaserEventEmitter.once(`${npc.name}${EFFECT_COMPLETE_EVENT_KEY}`, async () => {
      await applyNpcEffectsRecursive(scene, npc, effects);
    });

  await applyNpcEffect(scene, npc, effects.shift());
};
