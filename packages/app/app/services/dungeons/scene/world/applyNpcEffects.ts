import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { SceneWithPlugins } from "vue-phaserjs";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { applyNpcEffect } from "@/services/dungeons/scene/world/applyNpcEffect";
import { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import { phaserEventEmitter } from "@/services/phaser/events";
import { getResultAsync, noop } from "@esposter/shared";

export const applyNpcEffects = async (scene: SceneWithPlugins, npc: Npc) => {
  await applyNpcEffectsRecursive(scene, npc, [...npc.effects]);
};

const applyNpcEffectsRecursive = async (scene: SceneWithPlugins, npc: Npc, effects: Effect[]) => {
  if (effects.length > 1)
    phaserEventEmitter.once(
      `${npc.name}${EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`,
      // Nothing awaits the listener, so the chain terminates itself — an effect that rejects stops the
      // Sequence where it stands, and unreported it stops it silently
      getSynchronizedFunction(() =>
        getResultAsync(() => applyNpcEffectsRecursive(scene, npc, effects)).match(noop, console.error),
      ),
    );

  await applyNpcEffect(scene, npc, effects.shift());
};
