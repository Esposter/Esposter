import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { EFFECT_COMPLETE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";

export const applyNpcEffect = async (scene: SceneWithPlugins, npc: Npc, effect: Effect | undefined) => {
  if (!effect) return;

  switch (effect.type) {
    case EffectType.Message:
      {
        const worldDialogStore = useWorldDialogStore();
        const { showMessages } = worldDialogStore;
        await showMessages(
          scene,
          effect.messages.map((text) => ({ title: npc.name, text })),
          () => {
            phaserEventEmitter.emit(`${npc.name}${EFFECT_COMPLETE_EVENT_KEY}`);
          },
        );
      }
      break;
    default:
      break;
  }
};
