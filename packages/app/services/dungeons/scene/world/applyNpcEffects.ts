import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { SceneWithPlugins } from "vue-phaserjs";

import { applyNpcEffect } from "@/services/dungeons/scene/world/applyNpcEffect";
import { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import { phaserEventEmitter } from "@/services/phaser/events";
import { getSynchronizedFunction } from "@/util/getSynchronizedFunction";

export const applyNpcEffects = async (scene: SceneWithPlugins, npc: Npc) => {
  await applyNpcEffectsRecursive(scene, npc, [...npc.effects]);
};

const applyNpcEffectsRecursive = async (scene: SceneWithPlugins, npc: Npc, effects: Effect[]) => {
  if (effects.length > 1)
    phaserEventEmitter.once(
      `${npc.name}${EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`,
      getSynchronizedFunction(() => applyNpcEffectsRecursive(scene, npc, effects)),
    );

  await applyNpcEffect(scene, npc, effects.shift());
};
