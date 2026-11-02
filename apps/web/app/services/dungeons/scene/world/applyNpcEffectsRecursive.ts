import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { SceneWithPlugins } from "vue-phaserjs";

import { applyNpcEffect } from "@/services/dungeons/scene/world/applyNpcEffect";
import { getEffectCompleteEventKey } from "@/services/dungeons/scene/world/getEffectCompleteEventKey";
import { phaserEventEmitter } from "@/services/phaser/phaserEventEmitter";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

export const applyNpcEffectsRecursive = async (scene: SceneWithPlugins, npc: Npc, effects: Effect[]) => {
  if (effects.length > 1)
    phaserEventEmitter.once(
      getEffectCompleteEventKey(npc.name),
      // Nothing awaits the listener, so the chain terminates itself — an effect that rejects stops the
      // Sequence where it stands, and unreported it stops it silently
      getSynchronizedFunction(() =>
        getResultAsync(() => applyNpcEffectsRecursive(scene, npc, effects)).match(noop, console.error),
      ),
    );

  await applyNpcEffect(scene, npc, effects.shift());
};
