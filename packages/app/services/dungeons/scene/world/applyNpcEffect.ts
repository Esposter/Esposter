import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import type { SceneWithPlugins } from "vue-phaserjs";

import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import { dayjs } from "@/services/dayjs";
import { EFFECT_COMPLETE_EVENT_KEY_SUFFIX } from "@/services/phaser/constants";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { Cameras } from "phaser";
import { sleep } from "vue-phaserjs";

export const applyNpcEffect = async (scene: SceneWithPlugins, npc: Npc, effect: Effect | undefined) => {
  if (!effect) return;

  const onComplete = () => {
    phaserEventEmitter.emit(`${npc.name}${EFFECT_COMPLETE_EVENT_KEY_SUFFIX}`);
  };

  switch (effect.type) {
    case EffectType.Heal: {
      const worldPlayerStore = useWorldPlayerStore();
      const { healParty } = worldPlayerStore;
      healParty();
      break;
    }
    case EffectType.Message:
      {
        const worldDialogStore = useWorldDialogStore();
        const { showMessages } = worldDialogStore;
        await showMessages(
          scene,
          effect.messages.map((text) => ({ text, title: npc.name })),
        );
        onComplete();
      }
      return;
    case EffectType.SceneFade:
      scene.cameras.main.fadeOut(dayjs.duration(1, "seconds").asMilliseconds());
      scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, async () => {
        await sleep(scene, dayjs.duration(1, "seconds").asMilliseconds());
        scene.cameras.main.fadeIn(dayjs.duration(1, "seconds").asMilliseconds());
        scene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
          onComplete();
        });
      });
      return;
    default:
      break;
  }

  onComplete();
};
