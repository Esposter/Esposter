import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { EFFECT_COMPLETE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { Effect } from "@/models/dungeons/npc/effect/Effect";
import { EffectType } from "@/models/dungeons/npc/effect/EffectType";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Npc } from "@/models/dungeons/scene/world/Npc";
import { dayjs } from "@/services/dayjs";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Cameras } from "phaser";
import { useWorldPlayerStore } from "~/store/dungeons/world/player";

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
    case EffectType.Heal:
      {
        const worldPlayerStore = useWorldPlayerStore();
        const { healParty } = worldPlayerStore;
        healParty();
      }
      break;
    case EffectType.SceneFade:
      scene.cameras.main.fadeOut(dayjs.duration(0.5, "seconds").asMilliseconds());
      scene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        scene.cameras.main.fadeIn(dayjs.duration(0.5, "seconds").asMilliseconds());
      });
      break;
    default:
      break;
  }
};
